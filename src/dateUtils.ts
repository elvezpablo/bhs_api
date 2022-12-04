import {parse} from 'date-fns';

const hours_8 = 28_800_000;
const hours_24 = 86_400_000;

const getToday = () => {
	const today =new Date()	
	today.setHours(0,0,0,0);
	// subtract timezone to berkeley -8
	const berkeleyOffset = today.getTime() - hours_8;
	const berkeleyDay = new Date(berkeleyOffset);
	
	return berkeleyDay;
} 

const getDayBounds = (date:string) => {
	// midnight of the current day universal time	
	const today =
		date && date.length > 0 ? parse(date, "yyyy-MM-dd", new Date()) : getToday()
	// offset to berkeley timezone
	today.setHours(8,0,0,0);	
	const begin = today.getTime();
	// 24 hours later
	const end = begin + hours_24;

	return [begin, end] as const;
}

export {
	getDayBounds
}