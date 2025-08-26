import React, { useState } from "react";
import {
  View,
  Text,
  ImageBackground,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Image,
  ScrollView,
  SafeAreaView,
  Platform,
  StatusBar,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import QuizHeader from "../components/QuizHeader";
import Button from "../components/Button";
import { quizService } from "../services/quiz";

import { RootStackParamList } from "../navigation/types";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

type PersonalityQuizNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "PersonalityQuiz"
>;
type PersonalityQuizRouteProp = RouteProp<
  RootStackParamList,
  "PersonalityQuiz"
>;

export default function PersonalityQuiz() {
  const navigation = useNavigation<PersonalityQuizNavigationProp>();
  const route = useRoute<PersonalityQuizRouteProp>();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [quiz, setQuiz] = React.useState<any | null>(null);

  const phone = route.params?.phone;

  React.useEffect(() => {
    (async () => {
      const q = await quizService.getActive();
      setQuiz(q);
    })();
  }, []);
  const question = quiz?.questions?.[currentQuestion];
  const selectedAnswer = question ? answers[question.id] : undefined;

  const handleAnswer = (answerId: string) => {
    if (!question) return;
    setAnswers((prev) => ({ ...prev, [question.id]: answerId }));
  };

  const handleNext = async () => {
    if (!quiz || !quiz.questions) return;
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    } else {
      const payload = quiz.questions.map((q: any) => ({
        questionId: q.id,
        answerKey: answers[q.id],
      }));
      await quizService.submitAnswers(quiz.id, payload);
      navigation.navigate("InterestSelector", { phone });
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
    } else {
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Quiz header */}
        <QuizHeader
          onBack={handleBack}
          current={currentQuestion}
          total={quiz?.questions?.length || 0}
        />

        {/* Question image */}
        <ImageBackground
          source={{
            uri:
              question?.imageUrl ||
              "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200",
          }}
          style={styles.image}
          imageStyle={{ borderRadius: 16 }}
        >
          <View style={styles.imageOverlay} />
        </ImageBackground>

        {/* Question */}
        <View style={styles.questionBox}>
          <Text style={styles.questionText}>{question?.question || ""}</Text>
        </View>

        {/* Answers */}
        <ScrollView style={{ flex: 1, paddingHorizontal: 20 }}>
          {question?.answers?.map((answer: any) => (
            <TouchableOpacity
              key={answer.id}
              onPress={() => handleAnswer(answer.key)}
              style={[
                styles.answerButton,
                selectedAnswer === answer.key && styles.selectedAnswer,
              ]}
            >
              <View style={styles.radio}>
                {selectedAnswer === answer.key && (
                  <View style={styles.radioSelected} />
                )}
              </View>
              <Text
                style={[
                  styles.answerText,
                  selectedAnswer === answer.key && styles.answerTextSelected,
                ]}
              >
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
            type="gradient"
            title={
              quiz && quiz.questions && currentQuestion < quiz.questions.length - 1
                ? "Continue"
                : "Complete Quiz"
            }
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#000",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  image: {
    height: 160,
    marginHorizontal: 20,
    borderRadius: 16,
    marginBottom: 12,
    overflow: "hidden",
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  questionBox: {
    backgroundColor: "rgba(255,255,255,0.05)",
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  questionText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  answerButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  selectedAnswer: {
    backgroundColor: "rgba(204, 92, 36, 0.2)",
    borderColor: "rgba(204, 92, 36, 0.5)",
  },
  answerText: {
    color: "#ccc",
    marginLeft: 10,
    fontSize: 14,
  },
  answerTextSelected: {
    color: "#fff",
  },
  radio: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: "#ccc",
    alignItems: "center",
    justifyContent: "center",
  },
  radioSelected: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#cc5c24",
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    backgroundColor: "black",
  },
});
