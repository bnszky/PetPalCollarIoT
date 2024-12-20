import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { Colors } from '@/constants/Colors';

interface SubmitButtonProps {
    title: string;
    onClickHandler: () => void;
    isDisabled: boolean;
}

const SubmitButton = ({title, onClickHandler, isDisabled} : SubmitButtonProps) => {
  return (
    <TouchableOpacity
        style={[
          styles.connectButton,
          isDisabled && { opacity: 0.5 },
        ]}
        disabled={isDisabled}
        onPress={onClickHandler}
      >
        <Text style={{ textAlign: 'center' }}>
          {title}
        </Text>
      </TouchableOpacity>
  )
}

export default SubmitButton

const styles = StyleSheet.create({
    connectButton: {
        backgroundColor: Colors.green.primary,
        padding: 10,
        borderRadius: 5,
        marginHorizontal: 80,
        marginBottom: 50,
    },
})