import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacityProps,
  ViewStyle,
  TextStyle,
  StyleProp,
} from 'react-native';

type Variant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
type Size = 'default' | 'sm' | 'lg' | 'icon';

interface ButtonProps extends TouchableOpacityProps {
  title?: string;
  loading?: boolean;
  variant?: Variant;
  size?: Size;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  loading,
  variant = 'default',
  size = 'default',
  children,
  style,
  textStyle,
  ...props
}) => {
  const baseStyles = [styles.base];
  const variantStyles = stylesVariants[variant];
  const sizeStyles = sizeVariants[size];

  return (
    <TouchableOpacity
      style={[baseStyles, variantStyles, sizeStyles, style, props.disabled && styles.disabled]}
      activeOpacity={0.8}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'ghost' || variant === 'link' ? '#666' : '#fff'} />
      ) : children ? (
        children
      ) : title ? (
        <Text
          style={[
            styles.text,
            variant === 'ghost' && styles.textGhost,
            variant === 'link' && styles.textLink,
            textStyle,
          ]}
        >
          {title}
        </Text>
      ) : null}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 6,
  },
  text: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  textGhost: {
    color: '#444',
  },
  textLink: {
    color: '#1EC28B',
    textDecorationLine: 'underline',
  },
  disabled: {
    opacity: 0.5,
  },
});

const stylesVariants: Record<Variant, ViewStyle> = {
  default: {
    backgroundColor: '#1EC28B',
  },
  destructive: {
    backgroundColor: '#E53935',
  },
  outline: {
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: 'transparent',
  },
  secondary: {
    backgroundColor: '#f0f0f0',
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  link: {
    backgroundColor: 'transparent',
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
};

const sizeVariants: Record<Size, ViewStyle> = {
  default: {
    height: 40,
    paddingHorizontal: 16,
  },
  sm: {
    height: 36,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  lg: {
    height: 48,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  icon: {
    height: 40,
    width: 40,
    padding: 0,
    borderRadius: 20,
  },
};

export default Button;
