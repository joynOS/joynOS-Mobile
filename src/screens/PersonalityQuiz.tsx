import React, { useState } from 'react';
import { View, Text, ImageBackground, TouchableOpacity, StyleSheet, FlatList, Image, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import QuizHeader from '../components/QuizHeader';
import Button from '../components/Button';
import { QUIZ_QUESTIONS } from '../utils';

export default function PersonalityQuiz() {
    const navigation = useNavigation();
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState<Record<number, string>>({});

    const question = QUIZ_QUESTIONS[currentQuestion];
    const selectedAnswer = answers[question.id];

    const handleAnswer = (answerId: string) => {
        setAnswers(prev => ({ ...prev, [question.id]: answerId }));
    };

    const handleNext = () => {
        if (currentQuestion < QUIZ_QUESTIONS.length - 1) {
            setCurrentQuestion(prev => prev + 1);
        } else {
            navigation.navigate('InterestSelector' as never);
        }
    };

    const handleBack = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(prev => prev - 1);
        } else {
            navigation.goBack();
        }
    };

    return (
        <View style={styles.container}>
            {/* Quiz header */}
            <QuizHeader onBack={handleBack} current={currentQuestion} total={QUIZ_QUESTIONS.length} />

            {/* Question image */}
            <ImageBackground
                source={{ uri: question.image }}
                style={styles.image}
                imageStyle={{ borderRadius: 16 }}
            >
                <View style={styles.imageOverlay} />
            </ImageBackground>

            {/* Question */}
            <View style={styles.questionBox}>
                <Text style={styles.questionText}>{question.question}</Text>
            </View>

            {/* Answers */}
            <ScrollView style={{ flex: 1, paddingHorizontal: 20 }}>
                {question.answers.map(answer => (
                    <TouchableOpacity
                        key={answer.id}
                        onPress={() => handleAnswer(answer.id)}
                        style={[
                            styles.answerButton,
                            selectedAnswer === answer.id && styles.selectedAnswer,
                        ]}
                    >
                        <View style={styles.radio}>
                            {selectedAnswer === answer.id && <View style={styles.radioSelected} />}
                        </View>
                        <Text style={[
                            styles.answerText,
                            selectedAnswer === answer.id && styles.answerTextSelected
                        ]}>
                            {answer.text}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Footer button */}
            <View style={styles.footer}>
                <Button
                    onPress={handleNext}
                    disabled={!selectedAnswer}
                    title={currentQuestion < QUIZ_QUESTIONS.length - 1 ? 'Continue' : 'Complete Quiz'}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    image: {
        height: 160,
        marginHorizontal: 20,
        borderRadius: 16,
        marginBottom: 12,
        overflow: 'hidden',
    },
    imageOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    questionBox: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        marginHorizontal: 20,
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
    },
    questionText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    answerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        padding: 14,
        borderRadius: 12,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    selectedAnswer: {
        backgroundColor: 'rgba(138, 230, 140, 0.2)',
        borderColor: 'rgba(138, 230, 140, 0.5)',
    },
    answerText: {
        color: '#ccc',
        marginLeft: 10,
        fontSize: 14,
    },
    answerTextSelected: {
        color: '#fff',
    },
    radio: {
        width: 14,
        height: 14,
        borderRadius: 7,
        borderWidth: 2,
        borderColor: '#ccc',
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioSelected: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#8AE68C',
    },
    footer: {
        paddingHorizontal: 20,
        paddingBottom: 24,
        backgroundColor: 'black',
    },
});
