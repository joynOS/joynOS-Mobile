import React, { useState } from 'react';
import { Image, StyleSheet } from 'react-native';

const EventImage = ({ imageUrl }: { imageUrl: string }) => {
  const [imgUri, setImgUri] = useState(imageUrl);

  return (
    <Image
      source={{ uri: imgUri }}
      style={styles.eventCardImage}
      onError={() =>
        setImgUri(
          'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=1200&fit=crop&q=80'
        )
      }
    />
  );
};

const styles = StyleSheet.create({
  eventCardImage: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12, 
  },
});

export default EventImage;
