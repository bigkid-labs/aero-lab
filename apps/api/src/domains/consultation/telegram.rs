use teloxide::{prelude::Requester, types::ChatId, Bot};

use crate::domains::consultation::model::ConsultationRequest;

/// Fire a Telegram alert to the sales team when a new consultation arrives.
/// Spawned as a background task — does NOT block the HTTP response.
pub async fn send_alert(
    token: String,
    chat_id: i64,
    req: ConsultationRequest,
    consultation_id: String,
    product_name: Option<String>,
) {
    let product_line = product_name
        .map(|p| format!("\nProduct: {p}"))
        .unwrap_or_default();

    let message_line = req
        .message
        .as_deref()
        .map(|m| format!("\nMessage: {m}"))
        .unwrap_or_default();

    let contact = match (req.email.as_deref(), req.phone.as_deref()) {
        (Some(e), Some(p)) => format!("{e} / {p}"),
        (Some(e), None)    => e.to_string(),
        (None,    Some(p)) => p.to_string(),
        (None,    None)    => "Not provided".to_string(),
    };

    let text = format!(
        "New Consultation Request\nID: {consultation_id}\nName: {name}{product_line}\nContact: {contact}{message_line}",
        name = req.full_name,
    );

    let bot = Bot::new(token);
    if let Err(e) = bot.send_message(ChatId(chat_id), text).await {
        tracing::error!("Telegram alert failed for consultation {consultation_id}: {e}");
    }
}
