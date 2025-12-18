import styles from "./Header.module.css";

export const Header = () => {
  const backToHome = () => {
    window.location.href = "/";
  };
  return (
    <>
      <header className={styles["site-header"]} id="header">
        <div className={styles.container}>
          <div className={styles["top-bar"]}>
            <span className={styles.divider}>|</span>
            <a href="/login" className={styles["top-link"]}>
              ĐĂNG NHẬP
            </a>
            <span className={styles.divider}>|</span>
            <a href="/home" className={styles["top-link"]}>
              Admin
            </a>

            <a href="#" className={styles["search-icon"]}>
              <i className="fa-solid fa-magnifying-glass"></i>
            </a>

            <a href="#" className={styles["country-selector"]}>
              VIETNAM - TIẾNG VIỆT
            </a>
          </div>

          <div className={styles["main-nav"]}>
            <div className={styles["logo-wrapper"]}>
              <img
                src="/images/airlinelogo.jpg"
                className={styles["logo-img"]}
                onClick={backToHome}
              />
            </div>

            <nav className={styles["nav-menu"]}>
              <ul>
                <li>
                  <a href="/">Trang chủ</a>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </header>
    </>
  );
};
