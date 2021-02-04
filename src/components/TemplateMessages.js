import React from "react";
import {Button} from "@material-ui/core";

function TemplateMessages(props) {

    const templates = props.templatesData;

    return (
        <div className="templateMessagesOuter">
            <div className="templateMessages">

                { Object.entries(templates).map((message, index) =>
                    <div key={message[0]} className="templateMessageWrapper">

                        <div className="templateMessages__message chat__message chat__receiver">
                            <span className={"templateMessage__status " + message[1].status}>{message[1].status}</span>
                            <span className="templateMessage__message">{message[1].text}</span>
                        </div>

                        {message[1].status === "approved" &&
                        <Button onClick={() => props.onSend(message[1])}>Send</Button>
                        }

                    </div>
                )}

            </div>
        </div>
    )
}

export default TemplateMessages;