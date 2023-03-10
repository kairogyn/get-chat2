import React from 'react';
import {
	FormControl,
	FormControlLabel,
	FormLabel,
	Radio,
	RadioGroup,
} from '@material-ui/core';
import { isEmptyString } from '../../../../helpers/Helpers';
import {
	PRIMARY_KEY_TYPE_TAG,
	PRIMARY_KEY_TYPE_WA_ID,
} from '../../BulkSendTemplateViaCSV';
import { Alert } from '@material-ui/lab';
import LabelIcon from '@material-ui/icons/Label';
import { useTranslation } from 'react-i18next';
import style from './StepSelectPrimaryKey.module.css';
import { findTagByName } from '../../../../helpers/TagHelper';
import { useSelector } from 'react-redux';

const StepSelectPrimaryKey = ({
	csvHeader,
	csvData,
	primaryKeyColumn,
	setPrimaryKeyColumn,
	primaryKeyType,
	setPrimaryKeyType,
}) => {
	const tags = useSelector((state) => state.tags.value);

	const { t } = useTranslation();

	const prepareRecipientsPreview = () => {
		const PREVIEW_LIMIT = 5;

		return (
			<div className={style.recipientsPreview}>
				{csvData?.slice(0, PREVIEW_LIMIT)?.map((item, itemIndex) => {
					if (primaryKeyType === PRIMARY_KEY_TYPE_TAG) {
						const tagName = item[primaryKeyColumn];
						const tag = findTagByName(tags, tagName);
						return (
							<span key={itemIndex}>
								<LabelIcon style={{ fill: tag?.web_inbox_color }} />{' '}
								{tagName ? tagName : t('(empty)')}
							</span>
						);
					}

					return (
						<span key={itemIndex}>
							{item[primaryKeyColumn] ? item[primaryKeyColumn] : t('(empty)')}
						</span>
					);
				})}
				{csvData?.length > PREVIEW_LIMIT && (
					<span className="bold">
						{t('+%d more', csvData.length - PREVIEW_LIMIT)}
					</span>
				)}
			</div>
		);
	};

	return (
		<>
			<FormControl>
				<FormLabel>{t('Select the column that contains recipients')}</FormLabel>
				<RadioGroup
					aria-label="primary-key"
					value={primaryKeyColumn}
					onChange={(event) => setPrimaryKeyColumn(event.target.value)}
					row
				>
					{csvHeader
						?.filter((headerColumn) => !isEmptyString(headerColumn))
						?.map((headerColumn, headerColumnIndex) => (
							<FormControlLabel
								value={headerColumn}
								control={<Radio />}
								label={headerColumn}
								key={headerColumnIndex}
							/>
						))}
				</RadioGroup>
			</FormControl>

			<FormControl>
				<FormLabel>{t('Select the type of recipients')}</FormLabel>
				<RadioGroup
					aria-label="primary-key"
					value={primaryKeyType}
					onChange={(event) => setPrimaryKeyType(event.target.value)}
					row
				>
					<FormControlLabel
						value={PRIMARY_KEY_TYPE_WA_ID}
						control={<Radio />}
						label={t('Phone numbers')}
					/>
					<FormControlLabel
						value={PRIMARY_KEY_TYPE_TAG}
						control={<Radio />}
						label={t('Tags')}
					/>
				</RadioGroup>
			</FormControl>

			{primaryKeyType && (
				<Alert severity="info">
					{primaryKeyType === PRIMARY_KEY_TYPE_WA_ID && (
						<>{t('You will send messages to phone numbers:')}</>
					)}

					{primaryKeyType === PRIMARY_KEY_TYPE_TAG && (
						<>{t('You will send messages to users tagged with:')}</>
					)}

					{!isEmptyString(primaryKeyType) && <>{prepareRecipientsPreview()}</>}
				</Alert>
			)}
		</>
	);
};

export default StepSelectPrimaryKey;
