import React, {ReactNode} from 'react'

// TODO: should this be a string-backed enum?
export enum PanelDirection {
  Horizontal,
  Vertical
}

type PanelManagerProps = {
  children: ReactNode[]
  dir?: PanelDirection
  leftWeight?: number
}

export const PanelManager = ({ children, dir = PanelDirection.Horizontal, leftWeight = 1 }: PanelManagerProps) => {
  return (
    <div className={'panels ' + (dir === PanelDirection.Vertical ? 'vertical' : '')}>
      {children.map((child, i) => (
        <Panel key={i} weight={i === 0 ? leftWeight : 1}>{child}</Panel>
      ))}
    </div>
  )
}

type PanelProps = {
  children: ReactNode
  weight: number
}

export const Panel = ({ children, weight }: PanelProps) => {
  return <div className="panel" style={{ flex: weight }}>{children}</div>
}