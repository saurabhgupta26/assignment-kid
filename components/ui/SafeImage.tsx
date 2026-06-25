import React, { useState, useCallback, useRef, memo } from 'react';
import {
  View,
  Image,
  ActivityIndicator,
  StyleSheet,
  ImageProps,
  ImageStyle,
  StyleProp,
} from 'react-native';
import { Image as ImageIcon } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';

// Only show the loading spinner if the image hasn't loaded within this many ms.
// Cached / fast images complete before this threshold → no spinner flash.
const SPINNER_DELAY_MS = 300;

interface SafeImageProps extends Omit<ImageProps, 'source'> {
  source: string | { uri: string } | number | undefined;
  style?: StyleProp<ImageStyle>;
  fallbackIconSize?: number;
}

const SafeImageInner: React.FC<SafeImageProps> = ({
  source,
  style,
  fallbackIconSize = 24,
  ...props
}) => {
  const { colors } = useTheme();
  const [showSpinner, setShowSpinner] = useState(false);
  const [hasError, setHasError] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Flatten style once — stored in a ref so it doesn't re-compute on every render.
  const flatStyle = useRef(StyleSheet.flatten(style) ?? {}).current as any;
  const { width, height } = flatStyle;
  const borderRadius: number = flatStyle.borderRadius ?? 8;

  const handleLoadStart = useCallback(() => {
    // Schedule spinner — cancelled immediately if image loads fast (cached / quick network)
    timerRef.current = setTimeout(() => setShowSpinner(true), SPINNER_DELAY_MS);
  }, []);

  const handleLoadEnd = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setShowSpinner(false);
  }, []);

  const handleError = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setShowSpinner(false);
    setHasError(true);
  }, []);

  const imageSource =
    !source ? null
    : typeof source === 'string' ? { uri: source }
    : source;

  if (hasError || !source) {
    return (
      <View
        style={[
          styles.placeholderContainer,
          {
            width,
            height,
            borderRadius,
            backgroundColor: colors.secondary || '#F3F4F6',
            borderColor: colors.border || '#E5E7EB',
          },
          style,
        ]}
      >
        <ImageIcon size={fallbackIconSize} color={colors.textSecondary || '#9CA3AF'} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { width, height }]}>
      <Image
        source={imageSource as any}
        style={[styles.image, style]}
        onLoadStart={handleLoadStart}
        onLoadEnd={handleLoadEnd}
        onError={handleError}
        fadeDuration={150}
        {...props}
      />
      {showSpinner && (
        <View
          style={[
            StyleSheet.absoluteFillObject,
            styles.loaderContainer,
            { borderRadius },
          ]}
        >
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  loaderContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  placeholderContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
  },
});

export const SafeImage = memo(SafeImageInner);
export default SafeImage;
