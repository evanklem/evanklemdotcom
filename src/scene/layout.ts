export const COMPACT_LAYOUT_MAX_WIDTH = 900
export const SCENE_CAMERA_Z = 3
export const SCENE_CAMERA_FOV_DEG = 50

export function isCompactScene(width: number) {
  return width <= COMPACT_LAYOUT_MAX_WIDTH
}

export function getSceneHalfWidth(width: number, height: number) {
  return getSceneHalfHeight() * (width / height)
}

export function getSceneHalfHeight() {
  const halfFovRad = (SCENE_CAMERA_FOV_DEG * Math.PI) / 360
  return SCENE_CAMERA_Z * Math.tan(halfFovRad)
}

export function clampToSceneFrame(x: number, width: number, height: number, radius: number) {
  const halfWidth = getSceneHalfWidth(width, height)
  const margin = 0.08
  const minX = -halfWidth + radius + margin
  const maxX = halfWidth - radius - margin
  return Math.min(Math.max(x, minX), maxX)
}
