import React from "react";
import ChatMessageImage from "./ChatMessageImage";
import ChatMessageVideo from "./ChatMessageVideo";
import ChatMessageDocument from "./ChatMessageDocument";
import {insertTemplateComponentParameters} from "../../../helpers/Helpers";
import {Button} from "@material-ui/core";
import SmsIcon from "@material-ui/icons/Sms";

function ChatMessageTemplate(props) {

    const data = props.data;
    const templateData = props.templateData;

    return (
        <div className="chat__template">
                    <span className="chat__templateHeader">
                        <SmsIcon />Template message:<br/>
                    </span>

            <div className="chat__templateContent">
                {templateData !== undefined
                    ?
                    <div>
                        {Object.values(templateData.components).map((component, index) =>
                            <div key={index}>
                                {component.type === "HEADER" &&
                                <div className="chat__templateContent__header">
                                    {component.format === "IMAGE" &&
                                    <ChatMessageImage data={data} source={data.getHeaderFileLink('image')} onPreview={() => props.onPreview(data)} />
                                    }
                                    {component.format === "VIDEO" &&
                                    <ChatMessageVideo
                                        data={data}
                                        source={data.getHeaderFileLink('video')}
                                        onPreview={() => props.onPreview(data)} />
                                    }
                                    {component.format === "DOCUMENT" &&
                                    <ChatMessageDocument data={data} />
                                    }
                                    {component.format === "TEXT" &&
                                    <div className="bold wordBreakAll" dangerouslySetInnerHTML={{ __html: insertTemplateComponentParameters(component, data.templateParameters) }} />
                                    }
                                </div>
                                }

                                {component.type === "BODY" &&
                                <div className="wordBreakAll" dangerouslySetInnerHTML={{ __html: insertTemplateComponentParameters(component, data.templateParameters) }} />
                                }

                                {component.type === "BUTTONS" &&
                                <div className="chat__templateContent__buttons">
                                    {component.buttons.map((button, buttonIndex) =>
                                        <Button key={buttonIndex} color="primary" fullWidth={true} disabled={true}>{button.text}</Button>
                                    )}
                                </div>
                                }
                            </div>
                        )}
                    </div>
                    :
                    <div>Missing template</div>
                }
            </div>
        </div>
    )
}

export default ChatMessageTemplate;