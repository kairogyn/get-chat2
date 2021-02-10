import React, {useEffect, useState} from 'react';
import Sidebar from "./Sidebar";
import Chat from "./Chat";
import {Avatar, Fade, IconButton} from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import PubSub from "pubsub-js";
import {
    BASE_URL,
    EVENT_TOPIC_CHAT_MESSAGE,
    EVENT_TOPIC_CONTACT_DETAILS_VISIBILITY,
    EVENT_TOPIC_SEARCH_MESSAGES_VISIBILITY
} from "../Constants";
import axios from "axios";
import {getConfig} from "../Helpers";
import UnseenMessageClass from "../UnseenMessageClass";
import {useParams} from "react-router-dom";
import {avatarStyles} from "../AvatarStyles";
import SearchMessage from "./SearchMessage";
import ContactDetails from "./ContactDetails";

function Main() {

    const {waId} = useParams();

    const [checked, setChecked] = React.useState(false);
    const [chatMessageToPreview, setChatMessageToPreview] = useState();
    const [unseenMessages, setUnseenMessages] = useState({});
    const [isSearchMessagesVisible, setSearchMessagesVisible] = useState(false);
    const [isContactDetailsVisible, setContactDetailsVisible] = useState(false);
    const [chosenContact, setChosenContact] = useState();

    const avatarClasses = avatarStyles();

    const hideImageOrVideoPreview = () => {
        setChatMessageToPreview(null);
    }

    const previewMedia = (chatMessage) => {
        if (!chatMessage) {
            hideImageOrVideoPreview();
            return false;
        }

        // Pause any playing audios
        PubSub.publishSync(EVENT_TOPIC_CHAT_MESSAGE, 'pause');

        setChatMessageToPreview(chatMessage);
    }

    const showNotification = (title, body, icon) => {
        function showNot() {
            // eslint-disable-next-line no-unused-vars
            const notification = new Notification(title, {
                body: body,
                icon: icon
            });
        }
        if (!window.Notification) {
            console.log('Browser does not support notifications.');
        } else {
            // Check if permission is already granted
            if (Notification.permission === 'granted') {
                showNot();
            } else {
                // request permission from user
                Notification.requestPermission().then(function (p) {
                    if (p === 'granted') {
                        showNot();
                    } else {
                        console.log('User blocked notifications.');
                    }
                }).catch(function (err) {
                    console.error(err);
                });
            }
        }
    }

    const onSearchMessagesVisibilityEvent = function (msg, data) {
        setSearchMessagesVisible(data);

        // Hide other sections
        if (data === true) {
            setContactDetailsVisible(false);
        }
    };

    const onContactDetailsVisibilityEvent = function (msg, data) {
        setContactDetailsVisible(data);

        // Hide other sections
        if (data === true) {
            setSearchMessagesVisible(false);
        }
    };

    useEffect(() => {
        const token1 = PubSub.subscribe(EVENT_TOPIC_SEARCH_MESSAGES_VISIBILITY, onSearchMessagesVisibilityEvent);
        const token2 = PubSub.subscribe(EVENT_TOPIC_CONTACT_DETAILS_VISIBILITY, onContactDetailsVisibilityEvent);
        return () => {
            PubSub.unsubscribe(token1);
            PubSub.unsubscribe(token2);
        }
    }, []);

    useEffect(() => {
        setChecked(true);

        // Get unseen messages
        getUnseenMessages();

        let intervalId = 0;

        if (waId) {
            intervalId = setInterval(() => {
                getUnseenMessages(true);
            }, 2500);

            console.log("Interval is set");
        }

        return () => {
            clearInterval(intervalId);

            // Hide search messages container
            setSearchMessagesVisible(false);
        }
    }, [waId]);

    const getUnseenMessages = (willNotify) => {
        axios.get( `${BASE_URL}unseen_messages/`,
            getConfig({
                offset: 0,
                limit: 50 // TODO: Could it be zero?
            })
        )
            .then((response) => {
                //console.log('Unseen messages', response.data);

                const preparedUnseenMessages = {};
                response.data.map((unseenMessage, index) => {
                    const prepared = new UnseenMessageClass(unseenMessage);
                    preparedUnseenMessages[prepared.waId] = prepared;
                });

                if (willNotify) {
                    let hasAnyNewMessages = false;
                    setUnseenMessages((prevState => {
                            Object.entries(preparedUnseenMessages).map((unseen, index) => {
                                const unseenWaId = unseen[0]
                                const number = unseen[1].unseenMessages;
                                if (unseenWaId !== waId) {
                                    // TODO: Consider a new contact (last part of the condition)
                                    if ((prevState[unseenWaId] && number > prevState[unseenWaId].unseenMessages) /*|| (!prevState[unseenWaId] && number > 0)*/) {
                                        hasAnyNewMessages = true;
                                    }
                                }
                            });

                            return preparedUnseenMessages;
                        }
                    ));

                    // Display a notification
                    if (hasAnyNewMessages) {
                        showNotification("New messages", "You have new messages!");
                    }
                } else {
                    setUnseenMessages(preparedUnseenMessages);
                }

            })
            .catch((error) => {
                // TODO: Handle errors
            });
    }

    return (
        <Fade in={checked}>
            <div className="app__body">
                <Sidebar unseenMessages={unseenMessages} />
                <Chat setChosenContact={setChosenContact} previewMedia={(chatMessage) => previewMedia(chatMessage)} />

                {isSearchMessagesVisible &&
                <SearchMessage />
                }

                {isContactDetailsVisible &&
                <ContactDetails contactData={chosenContact} />
                }

                {chatMessageToPreview &&
                <div className="app__imagePreview">
                    <div className="app__imagePreview__header">

                        <Avatar className={avatarClasses[chatMessageToPreview.preparedAvatarClassName]}>{chatMessageToPreview.preparedInitials}</Avatar>
                        <div className="app_imagePreview__header__senderInfo">
                            <h3>{chatMessageToPreview.preparedName}</h3>
                        </div>

                        <IconButton className="app__imagePreview__close" onClick={() => hideImageOrVideoPreview()}>
                            <CloseIcon fontSize="large" />
                        </IconButton>
                    </div>
                    <div className="app__imagePreview__container" onClick={() => hideImageOrVideoPreview()}>
                        {(chatMessageToPreview.imageId || chatMessageToPreview.imageLink) &&
                        <img className="app__imagePreview__image" src={chatMessageToPreview.generateImageLink()} alt="Preview"/>
                        }
                        {(chatMessageToPreview.videoId || chatMessageToPreview.videoLink) &&
                        <video className="app__imagePreview__video" src={chatMessageToPreview.generateVideoLink()} controls autoPlay={true} />
                        }
                    </div>
                </div>
                }
            </div>
        </Fade>
    )
}

export default Main;