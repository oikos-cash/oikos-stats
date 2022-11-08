import { FC } from 'react';
import styled from 'styled-components';

type ButtonProps = {
	text: string;
	isActive: boolean;
};

const Button: FC<ButtonProps> = ({ text, isActive }) => {
	return <ButtonContainer isActive={isActive}>{text}</ButtonContainer>;
};

export default Button;

const ButtonContainer = styled.button<{ isActive: boolean }>`
	background: ${(props) => (props.isActive ? props.theme.colors.brightBlue : 'none')};

	box-shadow: 0px 0px 10px rgba(114, 79, 24, 1);
	border-radius: 4px;
	border: none;
	width: 63px;
	height: 25px;
	margin-left: 10px;

	font-style: normal;
	font-weight: bold;
	font-size: 12px;
	/* or 185% */

	text-align: center;
	text-transform: uppercase;
	cursor: pointer;

	color: ${(props) => (props.isActive ? props.theme.colors.black1 : props.theme.colors.white)};
`;
