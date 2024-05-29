
type Handle = () => Promise<string>
const name: string = 'Tran Duy Dan'

const handle :Handle = ()=>  Promise.resolve(name)
console.log(name)
handle().then(console.log)