import {relative, dirname} from 'path';
import Project, {
  SourceFile,
  ImportDeclaration,
  ExportDeclaration,
} from 'ts-simple-ast';

export interface Options {
  src: string;
  isAbsoluteModule(filePath: string): boolean;
  resolveAbsoluteModule(path: string): string;
}

export default class TsAbsolutePathsTransformer {
  private options: Options;

  constructor(options: Options) {
    this.options = options;
  }

  transformAndSave() {
    const {src} = this.options;
    const project = new Project();

    project.addExistingSourceFiles(`${src}/**/*.ts`);
    project.addExistingSourceFiles(`${src}/**/*.tsx`);

    const files = project.getSourceFiles();

    for (const file of files) {
      this.transformModulePaths(file, file.getImportDeclarations());
      this.transformModulePaths(file, file.getExportDeclarations());
    }

    return project.save();
  }

  private transformModulePaths(
    file: SourceFile,
    moduleDeclarations: ImportDeclaration[] | ExportDeclaration[],
  ) {
    const {isAbsoluteModule} = this.options;
    const filePath = file.getFilePath();

    for (const moduleDeclaration of moduleDeclarations) {
      const path = this.getPathFromModuleDeclaration(moduleDeclaration);
      if (!path || !isAbsoluteModule(path)) {
        continue;
      }
      const relativePath = this.absoluteToRelativePath(filePath, path);
      moduleDeclaration.setModuleSpecifier(relativePath);
    }
  }

  private getPathFromModuleDeclaration(
    moduleDeclaration: ImportDeclaration | ExportDeclaration,
  ) {
    const path = moduleDeclaration.getModuleSpecifier();
    return path ? path.getLiteralValue() : null;
  }

  private absoluteToRelativePath(filePath: string, path: string) {
    const {resolveAbsoluteModule} = this.options;
    const relativePath = relative(
      dirname(filePath),
      resolveAbsoluteModule(path),
    );
    return relativePath.startsWith('.') ? relativePath : `./${relativePath}`;
  }
}
