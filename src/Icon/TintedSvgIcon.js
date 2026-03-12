import React, { useState, useEffect } from 'react'
import { Platform, View } from 'react-native'

let SvgXml = null
if (Platform.OS !== 'web') {
  SvgXml = require('react-native-svg').SvgXml
}

function replaceSvgColors(xml, color) {
  let result = xml.replace(/fill="(?!none"|url\()[^"]*"/gi, `fill="${color}"`)
  result = result.replace(
    /stroke="(?!none"|url\()[^"]*"/gi,
    `stroke="${color}"`
  )
  result = result.replace(/fill:\s*(?!none|url\()[^;"]+/gi, `fill: ${color}`)
  result = result.replace(
    /stroke:\s*(?!none|url\()[^;"]+/gi,
    `stroke: ${color}`
  )
  return result
}

const TintedSvgIcon = ({
  uri,
  width,
  height,
  color,
  style,
}) => {
  const [rawXml, setRawXml] = useState(null)

  useEffect(() => {
    let cancelled = false
    fetch(uri)
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`)
        }
        return res.text()
      })
      .then(text => {
        if (!cancelled) {
          setRawXml(text)
        }
      })
      .catch(err => {
        console.error('[TintedSvgIcon] Failed to fetch SVG:', err)
      })
    return () => {
      cancelled = true
    }
  }, [uri])

  const xml = rawXml ? replaceSvgColors(rawXml, color) : null

  if (!xml) {
    return <View style={[{ width, height }, style]} />
  }

  return (
    <SvgXml
      xml={xml}
      width={width}
      height={height}
      fill={color}
      style={style}
    />
  )
}

TintedSvgIcon.defaultProps = {
  style: undefined,
}

export default TintedSvgIcon
