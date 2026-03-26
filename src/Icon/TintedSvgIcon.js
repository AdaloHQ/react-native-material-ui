import React, { useState, useEffect } from 'react';
import { Platform, View } from 'react-native';
import PropTypes from 'prop-types';

let SvgXml = null;
if (Platform.OS !== 'web') {
  SvgXml = require('react-native-svg').SvgXml;
}

const svgCache = new Map();

function replaceSvgColors(xml, color) {
  let result = xml.replace(/fill="(?!none"|url\()[^"]*"/gi, `fill="${color}"`);
  result = result.replace(
    /stroke="(?!none"|url\()[^"]*"/gi,
    `stroke="${color}"`,
  );
  result = result.replace(/fill:\s*(?!none|url\()[^;"]+/gi, `fill: ${color}`);
  result = result.replace(
    /stroke:\s*(?!none|url\()[^;"]+/gi,
    `stroke: ${color}`,
  );
  return result;
}

function fetchSvg(uri) {
  if (svgCache.has(uri)) {
    return svgCache.get(uri);
  }
  const promise = fetch(uri)
    .then(res => {
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      return res.text();
    })
    .catch(() => {
      svgCache.delete(uri);
      return null;
    });
  svgCache.set(uri, promise);
  return promise;
}

const TintedSvgIcon = ({ uri, width, height, color, style }) => {
  const [rawXml, setRawXml] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetchSvg(uri).then(text => {
      if (!cancelled && text) {
        setRawXml(text);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [uri]);

  const xml = rawXml ? replaceSvgColors(rawXml, color) : null;

  if (!xml) {
    return <View style={[{ width, height }, style]} />;
  }

  return (
    <SvgXml
      xml={xml}
      width={width}
      height={height}
      fill={color}
      style={style}
    />
  );
};

const propTypes = {
  uri: PropTypes.string.isRequired,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  color: PropTypes.string.isRequired,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};

const defaultProps = {
  style: undefined,
};

TintedSvgIcon.propTypes = propTypes;
TintedSvgIcon.defaultProps = defaultProps;

export default TintedSvgIcon;
