import { useEffect, useState } from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import _ from 'underscore';
import Str from 'expensify-common/lib/str';
import HeaderWithBackButton from '../../../components/HeaderWithBackButton';
import Navigation from '../../../libs/Navigation/Navigation';
import ROUTES from '../../../ROUTES';
import * as User from '../../../libs/actions/User';
import compose from '../../../libs/compose';
import styles from '../../../styles/styles';
import ScreenWrapper from '../../../components/ScreenWrapper';
import TextInput from '../../../components/TextInput';
import Text from '../../../components/Text';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../../components/withWindowDimensions';
import * as CloseAccount from '../../../libs/actions/CloseAccount';
import ONYXKEYS from '../../../ONYXKEYS';
import Form from '../../../components/Form';
import CONST from '../../../CONST';
import ConfirmModal from '../../../components/ConfirmModal';

const propTypes = {
    /** Session of currently logged in user */
    session: PropTypes.shape({
        /** Email address */
        email: PropTypes.string.isRequired,
    }),

    ...windowDimensionsPropTypes,
    ...withLocalizePropTypes,
};

const defaultProps = {
    session: {
        email: null,
    },
};

function CloseAccountPage({ formatPhoneNumber, translate, session }) {
    const [modalState, setModalState] = useState({
        isConfirmModalVisible: false,
        reasonForLeaving: '',
    });

    useEffect(() => {
        return () => {
            CloseAccount.clearError();
        }
    }, [])

    function onConfirm() {
        User.closeAccount(modalState.reasonForLeaving);
        hideConfirmModal();
    }

    function showConfirmModal (values) {
        setModalState({
            isConfirmModalVisible: true,
            reasonForLeaving: values.reasonForLeaving,
        });
    }

    function hideConfirmModal() {
        setModalState({isConfirmModalVisible: false});
    }

    function validate(values) {
        const userEmailOrPhone = formatPhoneNumber(session.email);
        const errors = {};

        if (_.isEmpty(values.phoneOrEmail) || userEmailOrPhone.toLowerCase() !== values.phoneOrEmail.toLowerCase()) {
            errors.phoneOrEmail = 'closeAccountPage.enterYourDefaultContactMethod';
        }

        return errors;
    }

    
    const userEmailOrPhone = formatPhoneNumber(session.email);

    return (
        <ScreenWrapper includeSafeAreaPaddingBottom={false}>
            <HeaderWithBackButton
                title={translate('closeAccountPage.closeAccount')}
                onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS_SECURITY)}
            />
            <Form
                formID={ONYXKEYS.FORMS.CLOSE_ACCOUNT_FORM}
                validate={validate}
                onSubmit={showConfirmModal}
                submitButtonText={translate('closeAccountPage.closeAccount')}
                style={[styles.flexGrow1, styles.mh5]}
                isSubmitActionDangerous
            >
                <View style={[styles.flexGrow1]}>
                    <Text>{translate('closeAccountPage.reasonForLeavingPrompt')}</Text>
                    <TextInput
                        inputID="reasonForLeaving"
                        autoGrowHeight
                        textAlignVertical="top"
                        label={translate('closeAccountPage.enterMessageHere')}
                        containerStyles={[styles.mt5, styles.autoGrowHeightMultilineInput]}
                    />
                    <Text style={[styles.mt5]}>
                        {translate('closeAccountPage.enterDefaultContactToConfirm')} <Text style={[styles.textStrong]}>{userEmailOrPhone}</Text>.
                    </Text>
                    <TextInput
                        inputID="phoneOrEmail"
                        autoCapitalize="none"
                        label={translate('closeAccountPage.enterDefaultContact')}
                        containerStyles={[styles.mt5]}
                        autoCorrect={false}
                        keyboardType={Str.isValidEmail(userEmailOrPhone) ? CONST.KEYBOARD_TYPE.EMAIL_ADDRESS : CONST.KEYBOARD_TYPE.DEFAULT}
                    />
                    <ConfirmModal
                        title={translate('closeAccountPage.closeAccountWarning')}
                        onConfirm={onConfirm}
                        onCancel={hideConfirmModal}
                        isVisible={modalState.isConfirmModalVisible}
                        prompt={translate('closeAccountPage.closeAccountPermanentlyDeleteData')}
                        confirmText={translate('common.yesContinue')}
                        cancelText={translate('common.cancel')}
                        shouldShowCancelButton
                        danger
                    />
                </View>
            </Form>
        </ScreenWrapper>
    );
}

CloseAccountPage.propTypes = propTypes;
CloseAccountPage.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withWindowDimensions,
    withOnyx({
        session: {
            key: ONYXKEYS.SESSION,
        },
    }),
)(CloseAccountPage);
