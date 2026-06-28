import { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import {
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

import { Theme } from "@/constants/colors";

type ScheduleTimeFieldsProps = {
    startTime: string;
    endTime: string;
    onStartTimeChange: (value: string) => void;
    onEndTimeChange: (value: string) => void;
};

function timeStringToDate(value: string, fallbackHour: number) {
    const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(value);
    const date = new Date();

    date.setSeconds(0, 0);
    date.setHours(
        match ? Number(match[1]) : fallbackHour,
        match ? Number(match[2]) : 0
    );

    return date;
}

function dateToTimeString(value: Date) {
    const hours = value.getHours().toString().padStart(2, "0");
    const minutes = value.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
}

function openAndroidTimePicker(
    value: string,
    fallbackHour: number,
    onChange: (value: string) => void
) {
    DateTimePickerAndroid.open({
        value: timeStringToDate(value, fallbackHour),
        mode: "time",
        display: "spinner",
        is24Hour: true,
        minuteInterval: 5,
        onChange: (event, selectedDate) => {
            if (event.type === "set" && selectedDate) {
                onChange(dateToTimeString(selectedDate));
            }
        },
    });
}

function TimeField({
    label,
    value,
    fallbackHour,
    placeholder,
    onChange,
}: {
    label: string;
    value: string;
    fallbackHour: number;
    placeholder: string;
    onChange: (value: string) => void;
}) {
    return (
        <View style={styles.timeField}>
            <Text style={styles.label}>{label}</Text>

            {Platform.OS === "android" ? (
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`${label}-Uhrzeit auswählen`}
                    onPress={() =>
                        openAndroidTimePicker(
                            value,
                            fallbackHour,
                            onChange
                        )
                    }
                    style={({ pressed }) => [
                        styles.input,
                        styles.timePickerButton,
                        pressed && styles.pressed,
                    ]}
                >
                    <Text
                        style={
                            value
                                ? styles.timeValue
                                : styles.placeholder
                        }
                    >
                        {value || placeholder}
                    </Text>
                </Pressable>
            ) : (
                <TextInput
                    value={value}
                    onChangeText={onChange}
                    placeholder={placeholder}
                    placeholderTextColor={Theme.textSecondary}
                    keyboardType="numbers-and-punctuation"
                    maxLength={5}
                    style={styles.input}
                />
            )}
        </View>
    );
}

export function ScheduleTimeFields({
    startTime,
    endTime,
    onStartTimeChange,
    onEndTimeChange,
}: ScheduleTimeFieldsProps) {
    return (
        <>
            <View style={styles.timeRow}>
                <TimeField
                    label="Von"
                    value={startTime}
                    fallbackHour={8}
                    placeholder="08:00"
                    onChange={onStartTimeChange}
                />

                <TimeField
                    label="Bis"
                    value={endTime}
                    fallbackHour={14}
                    placeholder="14:00"
                    onChange={onEndTimeChange}
                />
            </View>

            <Text style={styles.hint}>
                Wähle Start und Ende im 24-Stunden-Format.
            </Text>
        </>
    );
}

const styles = StyleSheet.create({
    timeRow: {
        flexDirection: "row",
        gap: 12,
    },
    timeField: {
        flex: 1,
        gap: 8,
    },
    label: {
        color: Theme.textPrimary,
        fontSize: 15,
        fontWeight: "700",
    },
    input: {
        minHeight: 50,
        backgroundColor: Theme.card,
        borderColor: Theme.border,
        borderWidth: 1,
        borderRadius: 14,
        paddingHorizontal: 14,
        paddingVertical: 13,
    },
    timePickerButton: {
        justifyContent: "center",
    },
    pressed: {
        opacity: 0.8,
    },
    timeValue: {
        color: Theme.textPrimary,
        fontSize: 16,
    },
    placeholder: {
        color: Theme.textSecondary,
        fontSize: 16,
    },
    hint: {
        color: Theme.textSecondary,
        fontSize: 13,
        lineHeight: 19,
    },
});
