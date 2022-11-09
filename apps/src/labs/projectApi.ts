export type Project = {
  channelId: string
  code: string
}

export const projects: Project[] = [
  {
    channelId: 'abc',
    code: 'for (var i = 0; i < 10; i++) {\n  __;\n}'
  },
  {
    channelId: 'def',
    code: ''
  }
]

export type Asset = {
  url: string
}

const assets: [{channelId: string; assets: Asset[]}] = [
  {
    channelId: 'abc',
    assets: []
  }
]

export function fetchProject(channelId: string): Promise<Project> {
  return Promise.resolve(projects.filter(p => p.channelId === channelId)[0])
}

export function fetchAssets(channelId: string): Promise<Asset[]> {
  return Promise.resolve(assets.filter(a => a.channelId === channelId)[0].assets)
}