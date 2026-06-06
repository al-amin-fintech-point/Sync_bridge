/**
 * FILE: /home/al-amin/Al-amin/Project/Sync_bridge/desktop-app/src/components/Header.jsx
 * DESCRIPTION: Redesigned enterprise header for SyncBridge with modern aesthetics.
 */

export default function Header() {
    const styles = {
        container: {
            marginBottom: "40px",
            borderBottom: "1px solid rgba( 255, 255, 255, 0.1 )",
            paddingBottom: "20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
        },
        titleContainer: {
            display: "flex",
            alignItems: "center",
            gap: "12px"
        },
        logo: {
            width: "40px",
            height: "40px",
            background: "linear-gradient( 135deg, #6366f1 0%, #a855f7 100% )",
            borderRadius: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 12px rgba( 99, 102, 241, 0.3 )"
        },
        logoIcon: {
            color: "#ffffff",
            fontSize: "20px",
            fontWeight: "bold"
        },
        title: {
            margin: 0,
            fontSize: "28px",
            fontWeight: "800",
            background: "linear-gradient( 90deg, #ffffff 0%, #cbd5e1 100% )",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            letterSpacing: "-0.02em"
        },
        tagline: {
            fontSize: "12px",
            color: "#94a3b8",
            marginTop: "4px",
            textTransform: "uppercase",
            letterSpacing: "0.1em"
        }
    };

    return (
        <header style={ styles.container }>
            <div style={ styles.titleContainer }>
                <div style={ styles.logo }>
                    <span style={ styles.logoIcon }>S</span>
                </div>
                <div>
                    <h1 style={ styles.title }>SyncBridge</h1>
                    <div style={ styles.tagline }>High-Performance Mesh Network</div>
                </div>
            </div>
        </header>
    );
}