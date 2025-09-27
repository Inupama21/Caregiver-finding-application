import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  color?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({ title, onPress, color = '#fff', disabled = false }) => (
  <TouchableOpacity
    style={[
      styles.button, 
      { backgroundColor: disabled ? '#cccccc' : color },
      disabled && styles.disabledButton
    ]}
    onPress={disabled ? undefined : onPress}
    disabled={disabled}
  >
    <Text style={[styles.text, disabled && styles.disabledText]}>{title}</Text>
  </TouchableOpacity>
);



const styles = StyleSheet.create({
  button: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 8,
    backgroundColor:"white"
  },  
  text: {
    color: '#67B3FF',
    fontSize: 22,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.6,
  },
  disabledText: {
    color: '#999999',
  },
});

export default Button;
