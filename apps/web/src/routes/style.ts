import { createStaticStyles } from 'antd-style';

export const styles = createStaticStyles(({ css, cssVar }) => ({
  shell: css`
    max-width: 800px;
    margin: 0 auto;
    padding: 32px 24px 64px;
  `,
  header: css`
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding-bottom: 24px;
    border-bottom: 1px solid ${cssVar.colorBorderSecondary};
  `,
  nav: css`
    display: flex;
    gap: 24px;
    a {
      color: ${cssVar.colorTextSecondary};
    }
    a[aria-current='page'] {
      color: ${cssVar.colorText};
      text-decoration: underline;
      text-underline-offset: 6px;
    }
  `,
  main: css`
    padding-top: 48px;
    h1 {
      font-size: 32px;
      line-height: 1.2;
      letter-spacing: -0.8px;
    }
    p {
      color: ${cssVar.colorTextSecondary};
      line-height: 1.7;
    }
    a {
      color: ${cssVar.colorText};
      text-decoration: underline;
    }
  `,
  form: css`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
    max-width: 420px;
    margin-top: 32px;
  `,
}));
