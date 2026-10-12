import { Alert, Button, Input } from '@lobehub/ui/base-ui';
import { useState, type FormEvent } from 'react';
import { trpc } from '@/libs/trpc';
import { styles } from '../style';

export default function HomePage() {
  const [name, setName] = useState('World');
  const [submittedName, setSubmittedName] = useState('World');
  const greeting = trpc.hello.useQuery({ name: submittedName }, { retry: false });

  function submit(event: FormEvent) {
    event.preventDefault();
    if (name.trim() === submittedName) void greeting.refetch();
    else setSubmittedName(name.trim());
  }

  return (
    <>
      <h1>Make something yours.</h1>
      <p>A small starting point for your next LobeHub application.</p>
      <form className={styles.form} onSubmit={submit}>
        <label htmlFor="name">Your name</label>
        <Input
          id="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          maxLength={80}
          required
        />
        <Button htmlType="submit" loading={greeting.isFetching} disabled={!name.trim()}>
          Send greeting
        </Button>
        {greeting.isError ? (
          <Alert
            type="error"
            title="The greeting could not be loaded."
            action={<Button onClick={() => void greeting.refetch()}>Try again</Button>}
          />
        ) : (
          <p role="status" aria-live="polite">
            {greeting.isPending ? 'Loading greeting…' : greeting.data.message}
          </p>
        )}
      </form>
    </>
  );
}
