export default function Button({ children, ...props }: any) {
  return <button {...props} style={{ padding: '8px 16px', backgroundColor: '#008080', color: '#fff', borderRadius: 4 }}>{children}</button>;
}