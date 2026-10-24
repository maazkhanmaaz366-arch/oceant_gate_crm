const { GoogleGenAI } = require('@google/genai');

class AiService {
  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      this.ai = new GoogleGenAI({ apiKey: apiKey });
      console.log('🤖 Gemini AI Assistant Initialized');
    } else {
      console.warn('⚠️ GEMINI_API_KEY not found. AI features will use smart offline engine.');
    }
  }

  /**
   * Generates a tailored luxury WhatsApp proposal & quote for a CRM Lead.
   */
  async generateLeadProposal({ leadName, phone, serviceInterest, pax, travelDates, budget, notes }) {
    if (this.ai) {
      try {
        const prompt = `
          You are the Senior Luxury Concierge Director at OceanGate Travel & Tours Dubai.
          Client: ${leadName || 'VIP Guest'}
          Phone: ${phone || 'N/A'}
          Service Requested: ${serviceInterest || 'Dubai Luxury Experience'}
          Passengers: ${JSON.stringify(pax || { adults: 2 })}
          Dates: ${JSON.stringify(travelDates || {})}
          Budget: ${budget || 'Flexible / Luxury'}
          Notes: ${notes || 'None'}

          Generate a personalized, ultra-engaging, high-converting WhatsApp proposal ready to send to the client.
          Include:
          1. Warm luxury greeting addressing the guest.
          2. Tailored highlights of the requested experience (yacht cruise, desert safari, 5-star hotel, or helicopter tour).
          3. Estimated pricing in AED and inclusions.
          4. Call to action to confirm or customize the itinerary.

          Format response as JSON:
          {
            "whatsapp_message": "...",
            "email_subject": "...",
            "email_body": "...",
            "recommended_price_aed": 3500,
            "itinerary_highlights": ["Highlight 1", "Highlight 2", "Highlight 3"]
          }
        `;

        const response = await this.ai.models.generateContent({
          model: 'gemini-3.6-flash',
          contents: prompt,
        });

        const cleanJson = response.text.replace(/```json\n?|\n?```/g, '');
        return JSON.parse(cleanJson);
      } catch (err) {
        console.error('Gemini Lead Proposal Error, falling back to smart engine:', err);
      }
    }

    // Smart fallback generator
    const guestTitle = leadName ? leadName : 'Valued Guest';
    const service = serviceInterest || 'Exclusive Dubai Experience';
    const estimatedPrice = budget ? Number(budget) : service.toLowerCase().includes('yacht') ? 4800 : service.toLowerCase().includes('safari') ? 1600 : 3500;

    const whatsapp = `Hello ${guestTitle}! 🌊✨\n\nThank you for reaching out to *OceanGate Travel & Tours Dubai* regarding your inquiry for our *${service}*.\n\nWe have curated an exclusive VIP package tailored for your visit:\n• 🌟 Premium Dedicated Concierge & Logistics\n• 📍 Chauffeur pickup & VIP assistance across Dubai\n• 🥂 Complimentary luxury refreshments & bespoke itinerary\n• 💰 Estimated Package: AED ${estimatedPrice.toLocaleString()} (All-Inclusive)\n\nWould you like us to lock in these dates for you or customize any specific preferences? We are at your service!\n\nBest regards,\n*OceanGate VIP Operations Team*\n📞 +971 50 123 4567 | 🌐 oceangate.ae`;

    const emailBody = `Dear ${guestTitle},\n\nThank you for contacting OceanGate Travel & Tours. We are delighted to assist you with your upcoming ${service}.\n\nOur team has prepared a preliminary itinerary and quote for your review:\n- Service: ${service}\n- Total Investment: AED ${estimatedPrice.toLocaleString()}\n- Inclusions: Dedicated concierge, luxury transfers, and curated hospitality.\n\nPlease let us know if you require any adjustments or if you would like us to issue your confirmed booking confirmation.\n\nWarm regards,\nOceanGate Travel & Tours Dubai`;

    return {
      whatsapp_message: whatsapp,
      email_subject: `Exclusive ${service} Proposal for ${guestTitle} | OceanGate Dubai`,
      email_body: emailBody,
      recommended_price_aed: estimatedPrice,
      itinerary_highlights: [
        `VIP ${service} with private scheduling`,
        'Luxury Chauffeur pickup and return logistics',
        '24/7 dedicated guest concierge support'
      ]
    };
  }

  /**
   * Translates content or ticket data into Arabic, Russian, French, etc.
   */
  async translateText({ text, targetLanguage = 'ar' }) {
    if (this.ai) {
      try {
        const langNames = { ar: 'Arabic', ru: 'Russian', fr: 'French', de: 'German', zh: 'Mandarin Chinese' };
        const target = langNames[targetLanguage] || targetLanguage;

        const response = await this.ai.models.generateContent({
          model: 'gemini-3.6-flash',
          contents: `Translate the following travel & booking document text into natural, professional, high-end ${target}. Preserve all formatted variables, names, dates, and prices exactly.\n\nText:\n${text}`,
        });

        return { translated_text: response.text };
      } catch (err) {
        console.error('Gemini translation error, using dictionary fallback:', err);
      }
    }

    // Static dictionary fallbacks for booking tickets
    const translations = {
      ar: {
        'Booking Confirmation': 'تأكيد الحجز',
        'Customer Details': 'تفاصيل العميل',
        'Service Overview': 'نظرة عامة على الخدمة',
        'Logistics & Locations': 'الخدمات اللوجستية والمواقع',
        'Pickup Location': 'موقع الاستلام',
        'Drop-off Location': 'موقع التوصيل',
        'Hotel details': 'تفاصيل الفندق',
        'Total Price Paid': 'إجمالي المبلغ المدفوع',
        'CONFIRMED': 'مؤكد',
        'Thank you for choosing OceanGate Travel & Tours.': 'شكراً لاختياركم أوشن جيت للسياحة والسفر.'
      },
      ru: {
        'Booking Confirmation': 'Подтверждение бронирования',
        'Customer Details': 'Информация о клиенте',
        'Service Overview': 'Обзор услуги',
        'Logistics & Locations': 'Логистика и маршрут',
        'Pickup Location': 'Место посадки',
        'Drop-off Location': 'Место высадки',
        'Hotel details': 'Информация об отеле',
        'Total Price Paid': 'Итого оплачено',
        'CONFIRMED': 'ПОДТВЕРЖДЕНО',
        'Thank you for choosing OceanGate Travel & Tours.': 'Благодарим вас за выбор OceanGate Travel & Tours.'
      }
    };

    let translated = text;
    const dict = translations[targetLanguage] || {};
    Object.keys(dict).forEach(k => {
      translated = translated.split(k).join(dict[k]);
    });

    return { translated_text: translated };
  }

  async generateMarketingCopy(promptData) {
    if (!this.ai) {
      // Smart Fallback for ad copy
      const obj = promptData.objective || 'Dubai Luxury Experience';
      const platform = promptData.platform || 'Meta';
      return {
        variants: [
          `Experience the pinnacle of luxury with OceanGate. Book your private ${obj} today and discover Dubai like never before! 🌊✨`,
          `Unforgettable memories await. Enjoy exclusive VIP access and bespoke hospitality with our signature ${obj}. Reserve now! 🇦🇪💎`,
          `Limited sunset slots available this weekend for ${obj}. Tap below to chat directly with our concierge team! 🛥️🔥`
        ],
        headline: `Exclusive ${obj} in Dubai - Book with VIP Concierge`,
        hashtags: ['#OceanGateDubai', '#LuxuryTravel', '#DubaiYachts', '#DesertSafari', '#DubaiVillas'],
        image_prompt: `Stunning 4k cinematic aerial view of luxury yacht cruising in Dubai Marina during golden sunset, ultra-realistic photography`,
        image_url: `https://image.pollinations.ai/prompt/${encodeURIComponent(`Stunning 4k cinematic aerial view of luxury yacht cruising in Dubai Marina during golden sunset, ultra-realistic photography`)}?width=1024&height=1024&nologo=true`
      };
    }
    
    try {
      const { objective, targetAudience, platform, tone } = promptData;
      
      const response = await this.ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: `You are an expert digital marketer for OceanGate Travel.
        Objective: ${objective}
        Target Audience: ${targetAudience}
        Platform: ${platform}
        Tone of Voice: ${tone || 'Professional and engaging'}
        
        Generate exactly 3 engaging caption variants for this ad. 
        Also provide 1 strong headline, 5 relevant hashtags, and a highly descriptive image prompt for an AI image generator.
        CRITICAL INSTRUCTION FOR IMAGE PROMPT: Do NOT include human faces, crowds, or close-ups of people in the image prompt, as they render poorly. Instead, focus entirely on stunning landscapes, beautiful scenery, luxury vehicles (yachts, cars, helicopters), gorgeous hotel interiors, or people viewed purely in silhouette or from behind. Make the prompt cinematic, 4k, and ultra-realistic.
        Format the response in pure JSON (without markdown blocks) like this:
        {
          "variants": ["caption 1", "caption 2", "caption 3"],
          "headline": "headline text",
          "hashtags": ["#tag1", "#tag2"],
          "image_prompt": "highly descriptive visual prompt"
        }`,
      });
      
      const rawText = response.text;
      const cleanJson = rawText.replace(/```json\n?|\n?```/g, '');
      const parsedData = JSON.parse(cleanJson);
      
      if (parsedData.image_prompt) {
        parsedData.image_url = `https://image.pollinations.ai/prompt/${encodeURIComponent(parsedData.image_prompt)}?width=1024&height=1024&nologo=true`;
      }
      
      return parsedData;
    } catch (error) {
      console.warn('Gemini AI marketing generation notice, using smart fallback generator:', error.message || error);
      const obj = (promptData && promptData.objective) || 'Dubai Luxury Experience';
      return {
        variants: [
          `Experience the pinnacle of luxury with OceanGate. Book your private ${obj} today and discover Dubai like never before! 🌊✨`,
          `Unforgettable memories await. Enjoy exclusive VIP access and bespoke hospitality with our signature ${obj}. Reserve now! 🇦🇪💎`,
          `Limited sunset slots available this weekend for ${obj}. Tap below to chat directly with our concierge team! 🛥️🔥`
        ],
        headline: `Exclusive ${obj} in Dubai - Book with VIP Concierge`,
        hashtags: ['#OceanGateDubai', '#LuxuryTravel', '#DubaiYachts', '#DesertSafari', '#DubaiVillas'],
        image_prompt: `Stunning 4k cinematic aerial view of luxury yacht cruising in Dubai Marina during golden sunset, ultra-realistic photography`,
        image_url: `https://image.pollinations.ai/prompt/${encodeURIComponent(`Stunning 4k cinematic aerial view of luxury yacht cruising in Dubai Marina during golden sunset, ultra-realistic photography`)}?width=1024&height=1024&nologo=true`
      };
    }
  }
}

module.exports = new AiService();
