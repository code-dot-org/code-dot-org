import {useEffect, useState} from 'react'
import { Asset, Project } from './projectApi';
import { LoadProjectData } from "./types";

export default function useProject(channelId: string, loadProjectData: LoadProjectData) {
  const [project, setProject] = useState<Project|undefined>(undefined)
  const [assets, setAssets] = useState<Asset[]|undefined>(undefined)

  useEffect(() => {
    // double-check that this is the correct way to load data async in useEffect
    loadProjectData(channelId).then(result => {
      setProject(result.project)
      setAssets(result.assets)
    })
  }, [])

  return {
    project,
    assets
  }
}