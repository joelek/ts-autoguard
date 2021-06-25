export function absent<A>(subject: A | null | undefined): subject is null | undefined {
	return subject == null;
};

export function present<A>(subject: A | null | undefined): subject is A {
	return subject != null;
};
