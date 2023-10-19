
const isProduction = process.env.NODE_ENV === 'production';

export function makeImagePath(path:string) {
	if (isProduction) {
		return `/fluentDash/${path}`; /* todo: make it dynamic */
	}
	return path;
}
