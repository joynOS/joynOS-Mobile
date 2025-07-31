// import React, { useState, ReactNode } from 'react';
// import { View, TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';

// interface TabsProps {
//     defaultValue?: string;
//     children: ReactNode;
//     selected: string
//     onTabChange: (val: string) => void
// }

// interface TabsListProps {
//     children: ReactNode;
//     style?: ViewStyle;
// }

// interface TabsTriggerProps {
//     value: string;
//     label: string;
//     isActive: boolean;
//     onPress: () => void;
//     disabled?: boolean;
// }

// interface TabsContentProps {
//     value: string;
//     activeTab: string;
//     children: ReactNode;
// }

// export const Tabs = ({ selected, onTabChange, children }: TabsProps) => {
//   return (
//     <TabsContext.Provider value={{ activeTab: selected, setActiveTab: onTabChange }}>
//       {children}
//     </TabsContext.Provider>
//   )
// }

// // Context
// const TabsContext = React.createContext<{
//     activeTab: string;
//     setActiveTab: (val: string) => void;
// }>({
//     activeTab: '',
//     setActiveTab: () => { },
// });

// // TabsList
// export const TabsList = ({ children, style }: TabsListProps) => {
//     return (
//         <View style={[styles.tabList, style]}>
//             {children}
//         </View>
//     );
// };

// // TabsTrigger
// export const TabsTrigger = ({ value, label, isActive, onPress, disabled }: TabsTriggerProps) => {
//     return (
//         <TouchableOpacity
//             onPress={onPress}
//             disabled={disabled}
//             style={[
//                 styles.trigger,
//                 isActive && styles.triggerActive,
//                 disabled && styles.triggerDisabled,
//             ]}
//         >
//             <Text style={[styles.triggerText, isActive && styles.triggerTextActive]}>
//                 {label}
//             </Text>
//         </TouchableOpacity>
//     );
// };

// // TabsContent
// export const TabsContent = ({ value, activeTab, children }: TabsContentProps) => {
//     if (value !== activeTab) return null;
//     return <View style={styles.tabContent}>{children}</View>;
// };

// const styles = StyleSheet.create({
//     tabList: {
//         flexDirection: 'row',
//         backgroundColor: '#2A2A2A',
//         padding: 4,
//         borderRadius: 8,
//         marginBottom: 8,
//     },
//     trigger: {
//         flex: 1,
//         paddingVertical: 10,
//         paddingHorizontal: 12,
//         borderRadius: 6,
//         backgroundColor: '#3A3A3A',
//         alignItems: 'center',
//         marginHorizontal: 4,
//     },
//     triggerActive: {
//         backgroundColor: '#1EC28B',
//     },
//     triggerDisabled: {
//         opacity: 0.5,
//     },
//     triggerText: {
//         color: '#aaa',
//         fontSize: 14,
//         fontWeight: '500',
//     },
//     triggerTextActive: {
//         color: '#fff',
//     },
//     tabContent: {
//         padding: 16,
//     },
// });

import React, { useState, useContext, ReactNode } from 'react';
import {
    View,
    TouchableOpacity,
    Text,
    StyleSheet,
    ViewStyle,
    TextStyle,
} from 'react-native';

// ========== Types ==========
interface TabsProps {
    defaultValue?: string;
    children: ReactNode;
    selected: string;
    onTabChange: (val: string) => void;
}

interface TabsListProps {
    children: ReactNode;
    style?: ViewStyle;
}

interface TabsTriggerProps {
    value: string;
    label: string;
    isActive: boolean;
    onPress: () => void;
    disabled?: boolean;
}

interface TabsContentProps {
    value: string;
    activeTab: string;
    children: ReactNode;
}

interface TabProps {
    label: string;
    value: string;
    disabled?: boolean;
}

// ========== Context ==========
const TabsContext = React.createContext<{
    activeTab: string;
    setActiveTab: (val: string) => void;
}>({
    activeTab: '',
    setActiveTab: () => { },
});

// ========== Root Tabs Component ==========
export const Tabs = ({ selected, onTabChange, children }: TabsProps) => {
    return (
        <TabsContext.Provider value={{ activeTab: selected, setActiveTab: onTabChange }}>
            {children}
        </TabsContext.Provider>
    );
};

// ========== Tab (alias for TabsTrigger with context) ==========
export const Tab = ({ label, value, disabled }: TabProps) => {
    const { activeTab, setActiveTab } = useContext(TabsContext);

    return (
        <TabsTrigger
            label={label}
            value={value}
            disabled={disabled}
            isActive={activeTab === value}
            onPress={() => setActiveTab(value)}
        />
    );
};

// ========== TabsList ==========
export const TabsList = ({ children, style }: TabsListProps) => {
    return <View style={[styles.tabList, style]}>{children}</View>;
};

// ========== TabsTrigger ==========
export const TabsTrigger = ({ value, label, isActive, onPress, disabled }: TabsTriggerProps) => {
    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled}
            style={[
                styles.trigger,
                isActive && styles.triggerActive,
                disabled && styles.triggerDisabled,
            ]}
        >
            <Text style={[styles.triggerText, isActive && styles.triggerTextActive]}>
                {label}
            </Text>
        </TouchableOpacity>
    );
};

// ========== TabsContent ==========
export const TabsContent = ({ value, activeTab, children }: TabsContentProps) => {
    if (value !== activeTab) return null;
    return <View style={styles.tabContent}>{children}</View>;
};

// ========== Styles ==========
const styles = StyleSheet.create({
    tabList: {
        flexDirection: 'row',
        backgroundColor: '#2A2A2A',
        padding: 4,
        borderRadius: 8,
        marginBottom: 8,
    },
    trigger: {
        flex: 1,
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 6,
        backgroundColor: '#3A3A3A',
        alignItems: 'center',
        marginHorizontal: 4,
    },
    triggerActive: {
        backgroundColor: '#1EC28B',
    },
    triggerDisabled: {
        opacity: 0.5,
    },
    triggerText: {
        color: '#aaa',
        fontSize: 14,
        fontWeight: '500',
    },
    triggerTextActive: {
        color: '#fff',
    },
    tabContent: {
        padding: 16,
    },
});

