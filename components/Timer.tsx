import { FC, useEffect } from 'react';
import { useTimer } from 'react-timer-hook';

interface TimerProps {
	expiryTimestamp: number;
}

const addZeroPadding = (num: number): string =>
	num.toString().length === 2 ? num.toString() : '0' + num.toString();

const Timer: FC<TimerProps> = ({ expiryTimestamp }) => {
	const { seconds, minutes, hours, days, isRunning, start } = useTimer({ expiryTimestamp });

	useEffect(() => {
		if (!isRunning) {
			start();
		}
	}, []);

	return (
		<>{`${addZeroPadding(days)}:${addZeroPadding(hours)}:${addZeroPadding(
			minutes
		)}:${addZeroPadding(seconds)}`}</>
	);
};

export default Timer;