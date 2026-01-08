function createVerifyEmailTemplate(name, verifyLink) {
  return `
<!DOCTYPE html>
<html lang="he">
<head>
  <meta charset="UTF-8" />
  <title>אימות מייל</title>
</head>
<body style="margin:0;padding:0;background:#ffffff;font-family:Arial,Helvetica,sans-serif;color:#333;">
  <div style="max-width:600px;margin:0 auto;padding:24px;">
    <p style="font-size:18px;margin-bottom:16px;">שלום ${name || ""},</p>

    <p style="font-size:16px;line-height:1.6;margin-bottom:16px;">
      כדי להשלים את ההרשמה, צריך לאמת את כתובת המייל שלך.
    </p>

    <div style="margin:32px 0;">
      <a href="${verifyLink}"
         style="background-color:#ff5fa2;color:#fff;text-decoration:none;padding:12px 24px;border-radius:6px;font-size:16px;font-weight:bold;display:inline-block;">
        אימות מייל
      </a>
    </div>

    <p style="font-size:14px;color:#777;">
      אם לא נרשמת – אפשר להתעלם מהמייל.
    </p>

    <hr style="border:none;border-top:1px solid #eee;margin:32px 0;" />
    <p style="font-size:12px;color:#999;text-align:center;">© 2026 QB</p>
  </div>
</body>
</html>
`;
}

module.exports = { createVerifyEmailTemplate };
