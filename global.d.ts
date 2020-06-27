declare module "download-git-repo" {

  export default function download(
    repoPath: string,
    localPath: string,
    callback?: (e: Error) => void
  ): void;
}
