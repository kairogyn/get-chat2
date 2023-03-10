import React from 'react';
import DoneAll from '@material-ui/icons/DoneAll';
import DoneIcon from '@material-ui/icons/Done';
import ErrorIcon from '@material-ui/icons/Error';
import AccessTimeIcon from '@material-ui/icons/AccessTime';
import Moment from 'react-moment';
import '../../../../styles/InputRange.css';
import '../../../../AvatarStyles';
import NoteIcon from '@material-ui/icons/Note';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ChatMessageModel from '../../../../api/models/ChatMessageModel';
import MessageDateIndicator from '../MessageDateIndicator';
import ContextChatMessage from './ContextChatMessage';
import ReplyIcon from '@material-ui/icons/Reply';
import ChatMessageVideo from './ChatMessageVideo';
import ChatMessageImage from './ChatMessageImage';
import ChatMessageDocument from './ChatMessageDocument';
import ChatMessageVoice from './ChatMessageVoice';
import ChatMessageTemplate from './ChatMessageTemplate';
import ChatAssignmentEvent from '../../../ChatAssignmentEvent';
import ChatTaggingEvent from './ChatTaggingEvent';
import ChatMessageLocation from './ChatMessageLocation';
import { useTranslation } from 'react-i18next';
import InteractiveMessage from './InteractiveMessage';
import OrderMessage from './OrderMessage';
import ContactsMessage from './ContactsMessage';
import PrintMessage from '../../../PrintMessage';
import { Alert } from '@material-ui/lab';
import { Button } from '@material-ui/core';

const iconStyles = {
	fontSize: '15px',
};

function ChatMessage({
	data,
	templateData,
	displaySender,
	displayDate,
	contactProvidersData,
	onOptionsClick,
	goToMessageId,
	onPreview,
	isTemplatesFailed,
	retryMessage,
}) {
	const { t } = useTranslation();

	const dateFormat = 'H:mm';

	return (
		<div
			id={'message_' + data.id}
			className={
				'chat__message__outer' + (data.isFromUs === true ? ' outgoing' : '')
			}
		>
			{displayDate && <MessageDateIndicator timestamp={data.timestamp} />}

			{data.assignmentEvent && (
				<ChatAssignmentEvent data={data.assignmentEvent} />
			)}

			{data.taggingEvent && <ChatTaggingEvent data={data.taggingEvent} />}

			{!data.assignmentEvent && !data.taggingEvent && (
				<div>
					{(displaySender || displayDate) && (
						<PrintMessage
							className="chat__name"
							message={
								data.isFromUs === true
									? data.senderName
									: contactProvidersData[data.waId]?.[0]?.name ??
									  data.senderName
							}
						/>
					)}

					{data.type === ChatMessageModel.TYPE_STICKER && (
						<img
							className="chat__media chat__sticker"
							src={data.generateStickerLink()}
							alt={data.caption}
						/>
					)}

					<div
						className={
							'chat__message' +
							(data.hasMediaToPreview() ? ' hasMedia' : '') +
							(data.isFromUs === true
								? (data.isRead() ? ' chat__received' : '') + ' chat__outgoing'
								: '') +
							(!displaySender && !displayDate ? ' hiddenSender' : '') +
							(' messageType__' + data.type) +
							(data.isFailed ? ' chat__failed' : '')
						}
					>
						<div
							className="chat__message__more"
							onClick={(event) => onOptionsClick(event, data)}
						>
							<ExpandMoreIcon />
						</div>

						{data.isForwarded && (
							<div className="chat__forwarded">
								<ReplyIcon />
								<span>{t('Forwarded')}</span>
							</div>
						)}

						{data.contextMessage !== undefined && (
							<ContextChatMessage
								contextMessage={data.contextMessage}
								goToMessageId={goToMessageId}
							/>
						)}

						{data.type === ChatMessageModel.TYPE_IMAGE && (
							<ChatMessageImage
								data={data}
								source={data.generateImageLink()}
								onPreview={() => onPreview?.(data)}
							/>
						)}

						{data.type === ChatMessageModel.TYPE_VIDEO && (
							<ChatMessageVideo
								data={data}
								source={data.generateVideoLink()}
								onPreview={() => onPreview?.(data)}
							/>
						)}

						{(data.type === ChatMessageModel.TYPE_VOICE ||
							data.type === ChatMessageModel.TYPE_AUDIO) && (
							<ChatMessageVoice data={data} />
						)}

						{data.type === ChatMessageModel.TYPE_DOCUMENT && (
							<ChatMessageDocument data={data} />
						)}

						{data.type === ChatMessageModel.TYPE_STICKER && (
							<span>
								<NoteIcon fontSize="small" />
							</span>
						)}

						{data.type === ChatMessageModel.TYPE_LOCATION && (
							<ChatMessageLocation data={data} />
						)}

						{data.type === ChatMessageModel.TYPE_TEMPLATE && (
							<ChatMessageTemplate
								data={data}
								templateData={templateData}
								isTemplatesFailed={isTemplatesFailed}
								onPreview={() => onPreview?.(data)}
							/>
						)}

						{data.type === ChatMessageModel.TYPE_INTERACTIVE && (
							<InteractiveMessage data={data} />
						)}

						{data.type === ChatMessageModel.TYPE_ORDER && (
							<OrderMessage data={data} />
						)}

						{data.type === ChatMessageModel.TYPE_CONTACTS && (
							<ContactsMessage data={data} />
						)}

						{data.text ??
						data.caption ??
						data.buttonText ??
						data.interactiveButtonText ? (
							<PrintMessage
								className="wordBreakWord"
								message={
									data.text ??
									data.caption ??
									data.buttonText ??
									data.interactiveButtonText
								}
							/>
						) : (
							'\u00A0'
						)}

						{data.errors && (
							<Alert
								variant="filled"
								severity="error"
								className="chat__errors"
								action={
									data.isFailed &&
									data.canRetry() && (
										<Button
											color="inherit"
											size="small"
											onClick={() => retryMessage(data)}
										>
											{t('Retry')}
										</Button>
									)
								}
							>
								{data.errors.map((error, index) => (
									<div key={index}>{t(error.details ?? error.title)}</div>
								))}
							</Alert>
						)}

						<span className="chat__message__info">
							<span className="chat__timestamp">
								<Moment date={data.timestamp} format={dateFormat} unix />
							</span>

							{!data.isFailed && data.isFromUs === true && (
								<>
									{data.isPending() && (
										<AccessTimeIcon
											className="chat__iconPending"
											color="inherit"
											style={iconStyles}
										/>
									)}

									{data.isJustSent() && (
										<DoneIcon
											className="chat__iconDone"
											color="inherit"
											style={iconStyles}
										/>
									)}

									{data.isDeliveredOrRead() && (
										<DoneAll
											className="chat__iconDoneAll"
											color="inherit"
											style={iconStyles}
										/>
									)}
								</>
							)}

							{data.isFailed && (
								<ErrorIcon
									className="chat__iconError"
									color="inherit"
									style={iconStyles}
								/>
							)}
						</span>

						<div style={{ clear: 'both' }} />
					</div>
				</div>
			)}
		</div>
	);
}

export default ChatMessage;
