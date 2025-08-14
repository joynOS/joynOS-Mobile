import React from 'react';
import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

type AppleIconProps = {
  size?: number;
};

// Official Apple logo (monochrome)
const AppleIcon: React.FC<AppleIconProps> = ({ size = 20 }) => (
  <View style={{ marginRight: 8 }}>
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        fill="#FFFFFF"
        d="M16.365 1.43c0 1.14-.45 2.2-1.16 2.98-.71.79-1.87 1.4-3.03 1.32-.13-1.09.47-2.24 1.18-3.02.73-.84 2.02-1.45 3.01-1.52.02.09.02.17.02.24zM20.64 18.02c-.53 1.13-1.16 2.27-2.1 3.45-.79 1.03-1.79 2.31-3.12 2.33-1.17.03-1.54-.75-3.21-.75-1.68 0-2.09.73-3.26.78-1.35.05-2.39-1.11-3.19-2.13-1.74-2.22-3.08-6.27-1.29-9.02.89-1.36 2.37-2.22 4.02-2.25 1.26-.03 2.45.85 3.21.85.76 0 2.2-1.05 3.72-.89.63.03 2.41.26 3.55 1.95-.09.06-2.12 1.24-2.1 3.7.03 2.94 2.62 3.92 2.66 3.93z"
      />
    </Svg>
  </View>
);

export default AppleIcon;