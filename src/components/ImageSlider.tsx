import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Image,
  FlatList,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  Text,
} from 'react-native';
import PhotoMosaic from './PhotoMosaic';

interface ImageSliderProps {
  images: string[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
  showIndicators?: boolean;
  height?: number;
  onImagePress?: (index: number) => void;
  useMosaic?: boolean;
}

const { width: screenWidth } = Dimensions.get('window');

const groupImagesForMosaic = (images: string[], maxPerGroup: number = 3) => {
  const groups: string[][] = [];
  let currentGroup: string[] = [];
  
  images.forEach((image, index) => {
    currentGroup.push(image);
    
    if (currentGroup.length === maxPerGroup || index === images.length - 1) {
      groups.push([...currentGroup]);
      currentGroup = [];
    }
  });
  
  return groups;
};

export default function ImageSlider({
  images,
  autoPlay = true,
  autoPlayInterval = 3000,
  showIndicators = true,
  height = 400,
  onImagePress,
  useMosaic = false,
}: ImageSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const timerRef = useRef<NodeJS.Timeout>();

  const slideData = useMosaic ? groupImagesForMosaic(images) : images.map(img => [img]);
  const totalSlides = slideData.length;

  const startAutoPlay = () => {
    if (autoPlay && totalSlides > 1) {
      timerRef.current = setInterval(() => {
        setCurrentIndex(prevIndex => {
          const nextIndex = (prevIndex + 1) % totalSlides;
          flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
          return nextIndex;
        });
      }, autoPlayInterval);
    }
  };

  const stopAutoPlay = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = undefined;
    }
  };

  useEffect(() => {
    startAutoPlay();
    return () => stopAutoPlay();
  }, [autoPlay, totalSlides, autoPlayInterval]);

  const handleMomentumScrollEnd = (event: any) => {
    const slideSize = screenWidth;
    const index = Math.round(event.nativeEvent.contentOffset.x / slideSize);
    setCurrentIndex(index);
  };

  const handleTouchStart = () => {
    stopAutoPlay();
  };

  const handleTouchEnd = () => {
    setTimeout(() => startAutoPlay(), 2000);
  };

  const renderSlide = ({ item, index }: { item: string[]; index: number }) => (
    <View
      style={[styles.slideContainer, { width: screenWidth }]}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {useMosaic ? (
        <PhotoMosaic
          images={item}
          height={height}
          onImagePress={(imageIndex) => {
            const globalIndex = slideData
              .slice(0, index)
              .reduce((acc, slide) => acc + slide.length, 0) + imageIndex;
            onImagePress?.(globalIndex);
          }}
        />
      ) : (
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => onImagePress?.(index)}
        >
          <Image
            source={{ uri: item[0] }}
            style={[styles.image, { width: screenWidth, height }]}
            resizeMode="cover"
          />
        </TouchableOpacity>
      )}
    </View>
  );

  const renderIndicator = (index: number) => (
    <View
      key={index}
      style={[
        styles.indicator,
        currentIndex === index ? styles.activeIndicator : styles.inactiveIndicator,
      ]}
    />
  );

  if (!images || images.length === 0) {
    return (
      <View style={[styles.container, { height }]}>
        <View style={styles.placeholderContainer}>
          <Text style={styles.placeholderText}>No images</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { height }]}>
      <FlatList
        ref={flatListRef}
        data={slideData}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        keyExtractor={(item, index) => `slide-${index}`}
        getItemLayout={(data, index) => ({
          length: screenWidth,
          offset: screenWidth * index,
          index,
        })}
      />
      
      {showIndicators && totalSlides > 1 && (
        <View style={styles.indicatorsContainer}>
          {slideData.map((_, index) => renderIndicator(index))}
        </View>
      )}
      
      {totalSlides > 1 && (
        <View style={styles.counterContainer}>
          <Text style={styles.counterText}>
            {currentIndex + 1}/{totalSlides}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    backgroundColor: '#000',
  },
  slideContainer: {
    backgroundColor: '#000',
  },
  image: {
    backgroundColor: '#111',
  },
  indicatorsContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  indicator: {
    height: 4,
    borderRadius: 2,
  },
  activeIndicator: {
    width: 20,
    backgroundColor: '#fff',
  },
  inactiveIndicator: {
    width: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  counterContainer: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  counterText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#111',
  },
  placeholderText: {
    color: '#666',
    fontSize: 14,
  },
});