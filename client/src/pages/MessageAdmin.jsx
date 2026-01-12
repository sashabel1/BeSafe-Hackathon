import "../styles/MessageAdmin.css";
import { useState } from "react";
import { getToken } from "../lib/auth";

export default function MessageAdmin() {
    const [submitted, setSubmitted] = useState(false);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const token = getToken();

            const response = await fetch("/api/admin-messages", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                title,
                text: content,
            }),
            });

            if (!response.ok) {
            throw new Error("Failed to send message");
            }

            setSubmitted(true);
        } catch (error) {
            console.error(error);
        }
        };

  return (
    <div className="help-container">
        <div className="headline">
            <h1>צריכ/ה עזרה?</h1>
            <p>נחשפת לתוכן פוגעני? נחסמת? תקלה טכנית?</p>
            <p>לפניה לאדמיניות שלנו ניתן למלא את הטופס</p>
        </div>
        <div className="form-div">
            {!submitted ? (
                <form onSubmit={handleSubmit}>
                    <label htmlFor="title">נושא הפניה:</label>
                    <input id="title" name="title" value={title} onChange={(e) => setTitle(e.target.value)}/>
                    <label htmlFor="content">תוכן הפניה:</label>
                    <textarea id="content" name="content" rows="6" value={content} onChange={(e) => setContent(e.target.value)}/>

                    <button type="submit" className="send-button">
                        שלח
                    </button>
                </form>
            ) : (
                <div className="success-message">
                    <h2>הטופס נשלח בהצלחה!</h2>
                    <p>האדמיניות שלנו יחזרו אליך בהקדם 💗</p>
                </div>
            )}
        </div>
    </div>
  );
}