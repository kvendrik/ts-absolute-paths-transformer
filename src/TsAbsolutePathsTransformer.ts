import {relative, dirname} from 'path';
import Project, {
  SourceFile,
  ImportDeclaration,
  ExportDeclaration,
} from 'ts-simple-ast';

export interface Options {
  srcPath: string;
  isModule(filePath: string): boolean;
  resolveModulePath(path: string): string;
}

export default class TsAbsolutePathsTransformer {
  private options: Options;

  constructor(options: Options) {
    this.options = options;
  }

  transformAndSave() {
    const {srcPath} = this.options;
    const project = new Project();

    project.addExistingSourceFiles(`${srcPath}/**/*.ts`);
    project.addExistingSourceFiles(`${srcPath}/**/*.tsx`);

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
    const {isModule} = this.options;
    const filePath = file.getFilePath();

    for (const moduleDeclaration of moduleDeclarations) {
      const path = this.getPathFromModuleDeclaration(moduleDeclaration);
      if (!path || !isModule(path)) {
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

  private absoluteToRelativePath(filePath: string, modulePath: string) {
    const {resolveModulePath} = this.options;
    const relativePath = relative(
      dirname(filePath),
      resolveModulePath(modulePath),
    );
    return relativePath.startsWith('.') ? relativePath : `./${relativePath}`;
  }
}
