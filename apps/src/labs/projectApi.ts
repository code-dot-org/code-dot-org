export type Project = {
  channelId: string
  code: string
}

export const fakeChannelIds = ['abc', 'def']

export const projects: Project[] = [
  {
    channelId: fakeChannelIds[0],
    code: 'for (var i = 0; i < 10; i++) {\n  __;\n}'
  },
  {
    channelId: fakeChannelIds[1],
    code: 'console.log(\'hi\');'
  }
]

export type Asset = {
  src: string
}

const assets: {channelId: string; assets: Asset[]}[] = [
  {
    channelId: fakeChannelIds[0],
    assets: [
      {src: 'https://kittenrescue.org/wp-content/uploads/2017/03/KittenRescue_KittenCareHandbook.jpg'},
      {src: 'https://nationaltoday.com/wp-content/uploads/2020/07/Kitten-640x514.jpg'}
    ]
  },
  {
    channelId: fakeChannelIds[1],
    assets: [
      {src: 'https://cms.dierenbescherming.nl/assets/common/default/_540x335_crop_center-center_none/kittens06.jpg?tag=sm'}
    ]
  }
]

export function fetchProject(channelId: string): Promise<Project> {
  return Promise.resolve(projects.filter(p => p.channelId === channelId)[0])
}

export function fetchAssets(channelId: string): Promise<Asset[]> {
  return Promise.resolve(assets.filter(a => a.channelId === channelId)[0]?.assets)
}