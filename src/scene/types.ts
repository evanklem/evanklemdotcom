export type SectionId = 'about' | 'projects' | 'art'

export interface Region {
  readonly id: SectionId
  /**
   * Object-space angle around the Y axis where this region's face lives,
   * measured as `atan2(x, z)`. Normalized to [0, 2π). The mesh rotation that
   * brings this region to face the camera is `-objectAngle` (mod 2π).
   */
  readonly objectAngle: number
  readonly accentColor: string
}

export interface SnapResult {
  readonly region: Region
  readonly targetAngle: number
}
