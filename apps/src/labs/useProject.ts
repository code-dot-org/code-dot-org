import {useEffect, useState} from 'react'
import { Asset, Project, fakeChannelIds } from './projectApi';
import { LoadProjectData } from "./types";

export default function useProject(channelId: string, loadProjectData: LoadProjectData) {
  const [fakeChannelId, setFakeChannelId] = useState<string>(fakeChannelIds[0])
  const [project, setProject] = useState<Project|undefined>(undefined)
  const [assets, setAssets] = useState<Asset[]|undefined>(undefined)

  useEffect(() => {
    // double-check that this is the correct way to load data async in useEffect
    loadProjectData(fakeChannelId).then(result => {
      setProject(result.project)
      setAssets(result.assets)
    })
  }, [fakeChannelId])

  useEffect(() => {
    // set code in editor? trigger subscribers
  }, [project])

  return {
    project,
    assets,
    fakeChannelId,
    setFakeChannelId
  }
}