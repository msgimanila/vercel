import type FileRef from './file-ref';
import type FileFsRef from './file-fs-ref';
import type FileBlob from './file-blob';
import type { Lambda } from './lambda';
import type { Prerender } from './prerender';
import type { EdgeFunction } from './edge-function';

export interface Env {
  [name: string]: string | undefined;
}

export type File = FileRef | FileFsRef | FileBlob;
export interface FileBase {
  type: string;
  mode: number;
  contentType?: string;
  toStream: () => NodeJS.ReadableStream;
  toStreamAsync?: () => Promise<NodeJS.ReadableStream>;
}

export interface Files {
  [filePath: string]: File;
}

export interface Config {
  maxLambdaSize?: string;
  includeFiles?: string | string[];
  excludeFiles?: string | string[];
  bundle?: boolean;
  ldsflags?: string;
  helpers?: boolean;
  rust?: string;
  debug?: boolean;
  zeroConfig?: boolean;
  import?: { [key: string]: string };
  functions?: BuilderFunctions;
  projectSettings?: ProjectSettings;
  outputDirectory?: string;
  installCommand?: string;
  buildCommand?: string;
  devCommand?: string;
  framework?: string | null;
  nodeVersion?: string;
  [key: string]: unknown;
}

export interface Meta {
  isDev?: boolean;
  devCacheDir?: string;
  skipDownload?: boolean;
  requestPath?: string | null;
  filesChanged?: string[];
  filesRemoved?: string[];
  env?: Env;
  buildEnv?: Env;
  avoidTopLevelInstall?: boolean;
  [key: string]: unknown;
}

export interface BuildOptions {
  /**
   * All source files of the project
   */
  files: Files;

  /**
   * Name of entrypoint file for this particular build job. Value
   * `files[entrypoint]` is guaranteed to exist and be a valid File reference.
   * `entrypoint` is always a discrete file and never a glob, since globs are
   * expanded into separate builds at deployment time.
   */
  entrypoint: string;

  /**
   * A writable temporary directory where you are encouraged to perform your
   * build process. This directory will be populated with the restored cache.
   */
  workPath: string;

  /**
   * The "Root Directory" is assigned to the `workPath` so the `repoRootPath`
   * is the Git Repository Root. This is only relevant for Monorepos.
   * See https://vercel.com/blog/monorepos
   */
  repoRootPath?: string;

  /**
   * An arbitrary object passed by the user in the build definition defined
   * in `vercel.json`.
   */
  config: Config;

  /**
   * Metadata related to the invoker of the builder, used by `vercel dev`.
   * Builders may use the properties on this object to change behavior based
   * on the build environment.
   */
  meta?: Meta;
}

export interface PrepareCacheOptions {
  /**
   * All source files of the project
   */
  files: Files;

  /**
   * Name of entrypoint file for this particular build job. Value
   * `files[entrypoint]` is guaranteed to exist and be a valid File reference.
   * `entrypoint` is always a discrete file and never a glob, since globs are
   * expanded into separate builds at deployment time.
   */
  entrypoint: string;

  /**
   * A writable temporary directory where you are encouraged to perform your
   * build process.
   */
  workPath: string;

  /**
   * The "Root Directory" is assigned to the `workPath` so the `repoRootPath`
   * is the Git Repository Root. This is only relevant for Monorepos.
   * See https://vercel.com/blog/monorepos
   */
  repoRootPath?: string;

  /**
   * An arbitrary object passed by the user in the build definition defined
   * in `vercel.json`.
   */
  config: Config;
}

export interface ShouldServeOptions {
  /**
   * A path string from a request.
   */
  requestPath: string;

  /**
   * Name of entrypoint file for this particular build job. Value
   * `files[entrypoint]` is guaranteed to exist and be a valid File reference.
   * `entrypoint` is always a discrete file and never a glob, since globs are
   * expanded into separate builds at deployment time.
   */
  entrypoint: string;

  /**
   * All source files of the project
   */
  files: {
    [path: string]: FileFsRef;
  };

  /**
   * A writable temporary directory where you are encouraged to perform your
   * build process. This directory will be populated with the restored cache.
   */
  workPath: string;

  /**
   * An arbitrary object passed by the user in the build definition defined
   * in `vercel.json`.
   */
  config: Config;
}

/**
 * `startDevServer()` is given the same parameters as `build()`.
 */
export type StartDevServerOptions = BuildOptions;

export interface StartDevServerSuccess {
  /**
   * Port number where the dev server can be connected to, assumed to be running
   * on `localhost`.
   */
  port: number;

  /**
   * Process ID number of the dev server. Useful for the `vercel dev` server to
   * shut down the dev server once an HTTP request has been fulfilled.
   */
  pid: number;
}

/**
 * `startDevServer()` may return `null` to opt-out of spawning a dev server for
 * a given `entrypoint`.
 */
export type StartDevServerResult = StartDevServerSuccess | null;

/**
 * Credit to Iain Reid, MIT license.
 * Source: https://gist.github.com/iainreid820/5c1cc527fe6b5b7dba41fec7fe54bf6e
 */
// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace PackageJson {
  /**
   * An author or contributor
   */
  export interface Author {
    name: string;
    email?: string;
    homepage?: string;
  }

  /**
   * A map of exposed bin commands
   */
  export interface BinMap {
    [commandName: string]: string;
  }

  /**
   * A bugs link
   */
  export interface Bugs {
    email: string;
    url: string;
  }

  export interface Config {
    name?: string;
    config?: unknown;
  }

  /**
   * A map of dependencies
   */
  export interface DependencyMap {
    [dependencyName: string]: string;
  }

  /**
   * CommonJS package structure
   */
  export interface Directories {
    lib?: string;
    bin?: string;
    man?: string;
    doc?: string;
    example?: string;
  }

  export interface Engines {
    node?: string;
    npm?: string;
  }

  export interface PublishConfig {
    registry?: string;
  }

  /**
   * A project repository
   */
  export interface Repository {
    type: string;
    url: string;
  }

  export interface ScriptsMap {
    [scriptName: string]: string;
  }
}

export interface PackageJson {
  readonly name?: string;
  readonly version?: string;
  readonly description?: string;
  readonly keywords?: string[];
  readonly homepage?: string;
  readonly bugs?: string | PackageJson.Bugs;
  readonly license?: string;
  readonly author?: string | PackageJson.Author;
  readonly contributors?: string[] | PackageJson.Author[];
  readonly files?: string[];
  readonly main?: string;
  readonly bin?: string | PackageJson.BinMap;
  readonly man?: string | string[];
  readonly directories?: PackageJson.Directories;
  readonly repository?: string | PackageJson.Repository;
  readonly scripts?: PackageJson.ScriptsMap;
  readonly config?: PackageJson.Config;
  readonly dependencies?: PackageJson.DependencyMap;
  readonly devDependencies?: PackageJson.DependencyMap;
  readonly peerDependencies?: PackageJson.DependencyMap;
  readonly optionalDependencies?: PackageJson.DependencyMap;
  readonly bundledDependencies?: string[];
  readonly engines?: PackageJson.Engines;
  readonly os?: string[];
  readonly cpu?: string[];
  readonly preferGlobal?: boolean;
  readonly private?: boolean;
  readonly publishConfig?: PackageJson.PublishConfig;
}

export interface NodeVersion {
  major: number;
  range: string;
  runtime: string;
  discontinueDate?: Date;
}

export interface Builder {
  use: string;
  src?: string;
  config?: Config;
}

export interface BuilderFunctions {
  [key: string]: {
    memory?: number;
    maxDuration?: number;
    runtime?: string;
    includeFiles?: string;
    excludeFiles?: string;
  };
}

export interface ProjectSettings {
  framework?: string | null;
  devCommand?: string | null;
  installCommand?: string | null;
  buildCommand?: string | null;
  outputDirectory?: string | null;
  rootDirectory?: string | null;
  createdAt?: number;
  autoExposeSystemEnvs?: boolean;
  sourceFilesOutsideRootDirectory?: boolean;
  directoryListing?: boolean;
  gitForkProtection?: boolean;
}

export interface BuilderV2 {
  version: 2;
  build: BuildV2;
  prepareCache?: PrepareCache;
}

export interface BuilderV3 {
  version: 3;
  build: BuildV3;
  prepareCache?: PrepareCache;
  startDevServer?: StartDevServer;
}

type ImageFormat = 'image/avif' | 'image/webp';

export interface Images {
  domains: string[];
  sizes: number[];
  minimumCacheTTL?: number;
  formats?: ImageFormat[];
}

export interface BuildResultV2 {
  // TODO: use proper `Route` type from `routing-utils` (perhaps move types to a common package)
  routes?: any[];
  images?: Images;
  output: {
    [key: string]: File | Lambda | Prerender | EdgeFunction;
  };
  wildcard?: Array<{
    domain: string;
    value: string;
  }>;
}

export interface BuildResultV3 {
  output: Lambda;
}

export type BuildV2 = (options: BuildOptions) => Promise<BuildResultV2>;
export type BuildV3 = (options: BuildOptions) => Promise<BuildResultV3>;
export type PrepareCache = (options: PrepareCacheOptions) => Promise<Files>;
export type StartDevServer = (
  options: StartDevServerOptions
) => Promise<StartDevServerResult>;
