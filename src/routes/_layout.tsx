import { NavLink, Outlet, useNavigation } from 'react-router';
import type { PublicConfig } from '@/shared/config';
import { styles } from './style';

export function RootLayout({ config }: { config: PublicConfig }) {
  const navigation = useNavigation();
  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <strong>{config.appName}</strong>
        <nav aria-label="Main navigation" className={styles.nav}>
          <NavLink to="/" end>
            Playground
          </NavLink>
          <NavLink to="/about">About</NavLink>
        </nav>
      </header>
      <main className={styles.main} aria-busy={navigation.state !== 'idle'}>
        <Outlet />
      </main>
    </div>
  );
}
