import PropTypes from "prop-types";
import "../styles/chat.css";

export default function Chat({title}) {

  return (
    <main className="chat">
      {/* Header */}
      <header className="chat_header">
        <div className="chat_title">{title}</div>
      </header>

      {/* Messages */}
      <section className="chat_messages">
        <div className="msg msg--bot">
          היי! ראיתי שגם אתה אוהב פורטנייט
          <div className="msg_meta">12:03</div>
        </div>

        <div className="msg msg--user">
          כן אני תמיד בעשרה הראשונים
          <div className="msg_meta">12:04</div>
        </div>

        <div className="msg msg--bot">
          וואו אתה טוב
          <div className="msg_meta">12:05</div>
        </div>
      </section>

      {/* Input */}
      <footer className="chat_input">
        <input
          className="chat_field"
          placeholder="הקלד הודעה..."
          disabled
        />
        <button className="chat_send" disabled>
          שלח
        </button>
      </footer>
    </main>
  );
}

Chat.propTypes = {
  title: PropTypes.string.isRequired,
};
