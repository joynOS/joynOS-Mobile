import React from 'react';
import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

type GoogleIconProps = {
  size?: number;
};

// Official multi-color Google "G" mark
const GoogleIcon: React.FC<GoogleIconProps> = ({ size = 20 }) => (
  <View style={{ marginRight: 8 }}>
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <Path
        fill="#FFC107"
        d="M43.611 20.083h-1.611V20H24v8h11.303c-1.648 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.949 3.051l5.657-5.657C34.046 6.074 29.268 4 24 4 12.954 4 4 12.954 4 24s8.954 20 20 20 20-8.954 20-20c0-1.358-.138-2.65-.389-3.917z"
      />
      <Path
        fill="#FF3D00"
        d="M6.306 14.691l6.571 4.819C14.371 16.243 18.82 13 24 13c3.059 0 5.842 1.154 7.949 3.051l5.657-5.657C34.046 6.074 29.268 4 24 4 16.319 4 9.666 8.337 6.306 14.691z"
      />
      <Path
        fill="#4CAF50"
        d="M24 44c5.18 0 9.9-1.979 13.451-5.197l-6.196-5.236C29.094 35.487 26.671 36 24 36c-5.202 0-9.646-3.316-11.302-7.96l-6.56 5.046C9.479 39.556 16.227 44 24 44z"
      />
      <Path
        fill="#1976D2"
        d="M43.611 20.083H44V20H24v8h11.303c-.715 2.02-2.011 3.774-3.852 5.035l6.196 5.236C35.83 39.142 44 34.335 44 24c0-1.358-.138-2.65-.389-3.917z"
      />
    </Svg>
  </View>
);

export default GoogleIcon;