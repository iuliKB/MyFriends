import ScreenWrapper from "../components/ScreenWrapper"
import { View, Text } from "react-native"

const Homepage = () => {
    return(
        <>
            <ScreenWrapper>
                <View>
                    <Text>Hi, Iulian</Text>
                    <View>
                        <Text>Upcoming events</Text>
                    </View>
                    <View>
                        {/* Widgets */}
                    </View>
                    {/* TODO: Navigation bar component */}
                </View>
            </ScreenWrapper>
        </>
    )
}

export default Homepage;