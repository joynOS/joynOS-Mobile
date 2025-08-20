import React from 'react';
import {
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';

interface PhotoMosaicProps {
  images: string[];
  height: number;
  onImagePress?: (index: number) => void;
}

const { width: screenWidth } = Dimensions.get('window');

export default function PhotoMosaic({ images, height, onImagePress }: PhotoMosaicProps) {
  if (!images || images.length === 0) {
    return <View style={[styles.container, { height }]} />;
  }

  const renderSingleImage = () => (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => onImagePress?.(0)}
      style={styles.singleContainer}
    >
      <Image
        source={{ uri: images[0] }}
        style={[styles.singleImage, { height }]}
        resizeMode="cover"
      />
    </TouchableOpacity>
  );

  const renderTwoImages = () => (
    <View style={[styles.twoImagesContainer, { height }]}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => onImagePress?.(0)}
        style={[styles.topImageContainer, { height: height * 0.3 - 1 }]}
      >
        <Image
          source={{ uri: images[0] }}
          style={styles.fullImage}
          resizeMode="cover"
        />
      </TouchableOpacity>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => onImagePress?.(1)}
        style={[styles.bottomImageContainer, { height: height * 0.7 - 1 }]}
      >
        <Image
          source={{ uri: images[1] }}
          style={styles.fullImage}
          resizeMode="cover"
        />
      </TouchableOpacity>
    </View>
  );

  const renderThreeImages = () => (
    <View style={[styles.threeImagesContainer, { height }]}>
      <View style={[styles.topImagesContainer, { height: height * 0.3 - 1 }]}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => onImagePress?.(0)}
          style={styles.topLeftContainer}
        >
          <Image
            source={{ uri: images[0] }}
            style={styles.fullImage}
            resizeMode="cover"
          />
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => onImagePress?.(1)}
          style={styles.topRightContainer}
        >
          <Image
            source={{ uri: images[1] }}
            style={styles.fullImage}
            resizeMode="cover"
          />
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => onImagePress?.(2)}
        style={[styles.bottomMainImageContainer, { height: height * 0.7 - 1 }]}
      >
        <Image
          source={{ uri: images[2] }}
          style={styles.fullImage}
          resizeMode="cover"
        />
      </TouchableOpacity>
    </View>
  );

  if (images.length === 1) {
    return renderSingleImage();
  } else if (images.length === 2) {
    return renderTwoImages();
  } else {
    return renderThreeImages();
  }
}

const styles = StyleSheet.create({
  container: {
    width: screenWidth,
    backgroundColor: '#000',
  },
  singleContainer: {
    width: screenWidth,
  },
  singleImage: {
    width: screenWidth,
  },
  fullImage: {
    width: '100%',
    height: '100%',
  },
  twoImagesContainer: {
    flexDirection: 'column',
    width: screenWidth,
  },
  topImageContainer: {
    width: '100%',
    marginBottom: 2,
    overflow: 'hidden',
  },
  bottomImageContainer: {
    width: '100%',
    overflow: 'hidden',
  },
  threeImagesContainer: {
    flexDirection: 'column',
    width: screenWidth,
  },
  topImagesContainer: {
    flexDirection: 'row',
    width: '100%',
    marginBottom: 2,
  },
  topLeftContainer: {
    flex: 1,
    marginRight: 1,
    overflow: 'hidden',
  },
  topRightContainer: {
    flex: 1,
    marginLeft: 1,
    overflow: 'hidden',
  },
  bottomMainImageContainer: {
    width: '100%',
    overflow: 'hidden',
  },
});