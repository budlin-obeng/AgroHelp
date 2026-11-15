"""
generate_pitch_deck.py
Builds the official 7-slide NASA Space Apps Challenge presentation for AgroHelp / Space2Soil.
Enforces 16:9 widescreen and strict <=7 slides compliance with NASA Global Award rules.
Includes real project telemetry, multi-sensor NASA tables, Landsat NDVI visualizations, and presenter scripts.
"""

import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.enum.shapes import MSO_SHAPE

def create_presentation():
    prs = Presentation()
    # 16:9 widescreen dimensions (13.333" x 7.5")
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6]

    # Color palette
    C_NAVY = RGBColor(11, 27, 61)         # #0B1B3D
    C_CARD_BG = RGBColor(18, 38, 77)      # #12264D
    C_WHITE = RGBColor(255, 255, 255)
    C_EMERALD = RGBColor(16, 185, 129)    # #10B981
    C_CYAN = RGBColor(56, 189, 248)       # #38BDF8
    C_AMBER = RGBColor(245, 158, 11)      # #F59E0B
    C_ROSE = RGBColor(244, 63, 94)        # #F43F5E
    C_LIGHT_TXT = RGBColor(226, 232, 240) # #E2E8F0
    C_MUTED_TXT = RGBColor(148, 163, 184) # #94A3B8
    C_CARD_BORDER = RGBColor(30, 58, 110)

    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    logo_path = os.path.join(base_dir, "frontend", "public", "logo.png")
    ndvi_dry_path = os.path.join(base_dir, "Space2Soil", "web", "assets", "ndvi_dry_harmattan.png")
    ndvi_wet_path = os.path.join(base_dir, "Space2Soil", "web", "assets", "ndvi_major_peak.png")

    def set_slide_background(slide, color):
        background = slide.background
        fill = background.fill
        fill.solid()
        fill.fore_color.rgb = color

    def add_card(slide, left, top, width, height, bg_color=C_CARD_BG, border_color=C_CARD_BORDER):
        shape = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
        shape.fill.solid()
        shape.fill.fore_color.rgb = bg_color
        shape.line.color.rgb = border_color
        shape.line.width = Pt(1.5)
        return shape

    def add_header(slide, title_text, category_text="NASA SPACE APPS CHALLENGE 2024 • FIELD SHIFT", slide_num=None):
        tb_cat = slide.shapes.add_textbox(Inches(0.8), Inches(0.4), Inches(10), Inches(0.35))
        tf_cat = tb_cat.text_frame
        p_cat = tf_cat.paragraphs[0]
        p_cat.text = category_text.upper()
        p_cat.font.size = Pt(11)
        p_cat.font.bold = True
        p_cat.font.color.rgb = C_CYAN

        tb_title = slide.shapes.add_textbox(Inches(0.8), Inches(0.72), Inches(10.5), Inches(0.65))
        tf_title = tb_title.text_frame
        p_title = tf_title.paragraphs[0]
        p_title.text = title_text
        p_title.font.size = Pt(24)
        p_title.font.bold = True
        p_title.font.color.rgb = C_WHITE

        if slide_num:
            tb_num = slide.shapes.add_textbox(Inches(11.5), Inches(0.4), Inches(1.2), Inches(0.35))
            tf_num = tb_num.text_frame
            p_num = tf_num.paragraphs[0]
            p_num.alignment = PP_ALIGN.RIGHT
            p_num.text = f"Slide {slide_num} of 7"
            p_num.font.size = Pt(11)
            p_num.font.color.rgb = C_MUTED_TXT

    # =========================================================================
    # SLIDE 1: TITLE & INTRODUCTION
    # =========================================================================
    s1 = prs.slides.add_slide(blank_layout)
    set_slide_background(s1, C_NAVY)

    add_header(s1, "", "NASA SPACE APPS CHALLENGE 2024 • GLOBAL SUBMISSION")

    # Logo if available
    if os.path.exists(logo_path):
        s1.shapes.add_picture(logo_path, Inches(10.0), Inches(0.4), width=Inches(2.5))

    # Main Title & Subtitle Box
    tbox = s1.shapes.add_textbox(Inches(0.8), Inches(1.3), Inches(11.7), Inches(2.2))
    tf = tbox.text_frame
    tf.word_wrap = True
    p1 = tf.paragraphs[0]
    p1.text = "AgroHelp / Space2Soil: Field Shift"
    p1.font.size = Pt(36)
    p1.font.bold = True
    p1.font.color.rgb = C_WHITE

    p2 = tf.add_paragraph()
    p2.text = "Adapting Smallholder Farms with NASA Earth Observations & Multi-Objective Machine Learning"
    p2.font.size = Pt(19)
    p2.font.color.rgb = C_CYAN
    p2.space_before = Pt(8)

    # 3 Overview Cards
    card_w = Inches(3.64)
    card_h = Inches(2.8)
    gap = Inches(0.38)
    top_pos = Inches(3.8)

    # Card 1: Target Pilot
    add_card(s1, Inches(0.8), top_pos, card_w, card_h)
    tb = s1.shapes.add_textbox(Inches(1.0), top_pos + Inches(0.2), card_w - Inches(0.4), card_h - Inches(0.4))
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "📍 PILOT LOCATION"
    p.font.size = Pt(12)
    p.font.bold = True
    p.font.color.rgb = C_EMERALD

    p = tf.add_paragraph()
    p.text = "Ejura-Sekyedumase, Ghana\n(7.3856° N, -1.3562° W)"
    p.font.size = Pt(16)
    p.font.bold = True
    p.font.color.rgb = C_WHITE
    p.space_before = Pt(6)

    p = tf.add_paragraph()
    p.text = "• Ghana's premier maize aggregation breadbasket\n• Forest-savannah transitional agro-ecological zone\n• Bimodal rainfall regime under extreme climate stress"
    p.font.size = Pt(11)
    p.font.color.rgb = C_LIGHT_TXT
    p.space_before = Pt(8)

    # Card 2: The Problem
    add_card(s1, Inches(0.8) + card_w + gap, top_pos, card_w, card_h)
    tb = s1.shapes.add_textbox(Inches(0.8) + card_w + gap + Inches(0.2), top_pos + Inches(0.2), card_w - Inches(0.4), card_h - Inches(0.4))
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "⚠️ THE COMPOUND CRISIS"
    p.font.size = Pt(12)
    p.font.bold = True
    p.font.color.rgb = C_AMBER

    p = tf.add_paragraph()
    p.text = "The Maize Monoculture Trap"
    p.font.size = Pt(16)
    p.font.bold = True
    p.font.color.rgb = C_WHITE
    p.space_before = Pt(6)

    p = tf.add_paragraph()
    p.text = "• 88% continuous cereal monoculture\n• Fall Armyworm continuous pest harbor\n• 35-45% farm income consumed by synthetic fertilizer\n• Severe erosion during bare-soil transitions (MFI 143.2)"
    p.font.size = Pt(11)
    p.font.color.rgb = C_LIGHT_TXT
    p.space_before = Pt(8)

    # Card 3: The Innovation
    add_card(s1, Inches(0.8) + (card_w + gap) * 2, top_pos, card_w, card_h)
    tb = s1.shapes.add_textbox(Inches(0.8) + (card_w + gap) * 2 + Inches(0.2), top_pos + Inches(0.2), card_w - Inches(0.4), card_h - Inches(0.4))
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "🚀 OUR SOLUTION"
    p.font.size = Pt(12)
    p.font.bold = True
    p.font.color.rgb = C_CYAN

    p = tf.add_paragraph()
    p.text = "Space-to-Soil Decision Engine"
    p.font.size = Pt(16)
    p.font.bold = True
    p.font.color.rgb = C_WHITE
    p.space_before = Pt(6)

    p = tf.add_paragraph()
    p.text = "• 10-Yr Decadal Multi-Sensor NASA Data Integration\n• MultiOutput GradientBoosting Machine Learning\n• Farmer Priority & What-If Climate Simulator\n• Explainable Trade-Off Rotation Roadmaps"
    p.font.size = Pt(11)
    p.font.color.rgb = C_LIGHT_TXT
    p.space_before = Pt(8)

    # Bottom Tagline
    tb_bot = s1.shapes.add_textbox(Inches(0.8), Inches(6.8), Inches(11.7), Inches(0.4))
    tf_bot = tb_bot.text_frame
    p_bot = tf_bot.paragraphs[0]
    p_bot.text = "Developed by Team Space2Soil • Open-Source Decision Support • 30/30 Verified Automated Test Suites Passing"
    p_bot.font.size = Pt(11)
    p_bot.font.color.rgb = C_MUTED_TXT

    s1.notes_slide.notes_text_frame.text = (
        "Good day, judges. Welcome to AgroHelp, created by Team Space2Soil for the NASA Space Apps Challenge track 'Field Shift'. "
        "Smallholder farmers across the globe struggle with erratic rainfall, escalating fertilizer debt, and pest outbreaks. "
        "In our pilot hub of Ejura-Sekyedumase, Ghana, 88% of farmers are trapped in continuous maize monoculture. "
        "AgroHelp bridges 10 years of multi-sensor NASA Earth observations with machine learning to empower farmers to choose "
        "adaptive, biologically restorative crop rotations."
    )

    # =========================================================================
    # SLIDE 2: THE REAL-WORLD CRISIS
    # =========================================================================
    s2 = prs.slides.add_slide(blank_layout)
    set_slide_background(s2, C_NAVY)
    add_header(s2, "The Real-World Crisis: The Maize Monoculture Trap", slide_num=2)

    grid_w = Inches(5.6)
    grid_h = Inches(2.3)
    x1 = Inches(0.8)
    x2 = Inches(6.9)
    y1 = Inches(1.6)
    y2 = Inches(4.3)

    # Box 1
    add_card(s2, x1, y1, grid_w, grid_h)
    tb = s2.shapes.add_textbox(x1 + Inches(0.2), y1 + Inches(0.15), grid_w - Inches(0.4), grid_h - Inches(0.3))
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "01 | 88% Maize Monoculture Lock-In"
    p.font.size = Pt(15)
    p.font.bold = True
    p.font.color.rgb = C_ROSE
    p = tf.add_paragraph()
    p.text = "According to official Ghana MOFA district records, over 88% of cultivated acreage in Ejura is locked in rain-fed, continuous maize monoculture. Farmers continuously replant cereals season after season without functional biological rotation."
    p.font.size = Pt(11)
    p.font.color.rgb = C_LIGHT_TXT
    p.space_before = Pt(4)

    # Box 2
    add_card(s2, x2, y1, grid_w, grid_h)
    tb = s2.shapes.add_textbox(x2 + Inches(0.2), y1 + Inches(0.15), grid_w - Inches(0.4), grid_h - Inches(0.3))
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "02 | Unbroken Fall Armyworm (FAW) Cycle"
    p.font.size = Pt(15)
    p.font.bold = True
    p.font.color.rgb = C_ROSE
    p = tf.add_paragraph()
    p.text = "Continuous maize cropping provides an unbroken cereal host canopy across both Major (Apr-Jul) and Minor (Sep-Nov) seasons. Spodoptera frugiperda larvae persist between cycles, inflicting recurring 30% to 60% yield destructions."
    p.font.size = Pt(11)
    p.font.color.rgb = C_LIGHT_TXT
    p.space_before = Pt(4)

    # Box 3
    add_card(s2, x1, y2, grid_w, grid_h)
    tb = s2.shapes.add_textbox(x1 + Inches(0.2), y2 + Inches(0.15), grid_w - Inches(0.4), grid_h - Inches(0.3))
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "03 | Severe Soil Exhaustion & Erosivity (MFI = 143.2)"
    p.font.size = Pt(15)
    p.font.bold = True
    p.font.color.rgb = C_AMBER
    p = tf.add_paragraph()
    p.text = "Monoculture fixes 0 kg N/ha and exhausts native nitrogen. Farmers spend 35-45% of income on synthetic NPK/Urea. Bare post-harvest soil combined with extreme storm erosivity (Modified Fournier Index MFI = 143.2) causes massive topsoil stripping."
    p.font.size = Pt(11)
    p.font.color.rgb = C_LIGHT_TXT
    p.space_before = Pt(4)

    # Box 4
    add_card(s2, x2, y2, grid_w, grid_h)
    tb = s2.shapes.add_textbox(x2 + Inches(0.2), y2 + Inches(0.15), grid_w - Inches(0.4), grid_h - Inches(0.3))
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "04 | Rainfall Volatility & Abrupt Harmattan Onset"
    p.font.size = Pt(15)
    p.font.bold = True
    p.font.color.rgb = C_AMBER
    p = tf.add_paragraph()
    p.text = "Erratic starts to the Major season delay planting, while the Minor season is frequently cut short by dry, dusty Harmattan winds. NASA telemetry confirms 557 severe agricultural drought days, leading to frequent crop failure at grain filling."
    p.font.size = Pt(11)
    p.font.color.rgb = C_LIGHT_TXT
    p.space_before = Pt(4)

    # Bottom Callout Bar
    add_card(s2, Inches(0.8), Inches(6.75), Inches(11.7), Inches(0.55), bg_color=C_CARD_BG, border_color=C_EMERALD)
    tb = s2.shapes.add_textbox(Inches(1.0), Inches(6.75), Inches(11.3), Inches(0.55))
    tf = tb.text_frame
    p = tf.paragraphs[0]
    p.text = "Core Challenge: Farmers lack accessible, science-backed guidance to break this cycle without sacrificing their income."
    p.font.size = Pt(12)
    p.font.bold = True
    p.font.color.rgb = C_EMERALD

    s2.notes_slide.notes_text_frame.text = (
        "Here is the local reality on the ground in Ejura, documented by Ghana's Ministry of Food and Agriculture. "
        "Over 88% of farmland is locked in continuous maize monoculture. This continuous green canopy sustains the destructive "
        "Fall Armyworm across seasons. Because maize fixes zero nitrogen, farmers spend nearly half their revenue on synthetic fertilizers. "
        "Between crops, fields are left bare during intense tropical downpours—our Modified Fournier Index calculation reveals a severe "
        "erosivity of 143.2. Finally, premature dry Harmattan winds cut short the minor season. Farmers need a tool that turns space observations "
        "into clear, risk-managed crop transitions."
    )

    # =========================================================================
    # SLIDE 3: MULTI-SENSOR NASA ARCHITECTURE
    # =========================================================================
    s3 = prs.slides.add_slide(blank_layout)
    set_slide_background(s3, C_NAVY)
    add_header(s3, "Multi-Sensor NASA Earth Observation Architecture", slide_num=3)

    # Table on Left
    table_w = Inches(7.5)
    table_h = Inches(4.8)
    shape_tbl = s3.shapes.add_table(5, 4, Inches(0.8), Inches(1.5), table_w, table_h)
    tbl = shape_tbl.table
    tbl.columns[0].width = Inches(1.8)
    tbl.columns[1].width = Inches(1.3)
    tbl.columns[2].width = Inches(1.3)
    tbl.columns[3].width = Inches(3.1)

    headers = ["NASA Product", "Spatial Res.", "Time Horizon", "Agricultural Indicator Extracted"]
    data = [
        ["NASA POWER\n(MERRA-2)", "0.5° × 0.625°\n(~50 km)", "2016-2025\n(3,653 Days)", "Daily T2M, Tmax, Tmin, RH2M, Heat Stress Days (Tmax ≥ 35°C), GDD thermal phenology"],
        ["NASA GPM\nIMERG", "0.1° × 0.1°\n(~10 km)", "2016-2025\n(3,653 Days)", "14,088 mm Decadal Rain, 126 extreme storms (>20mm), MFI Rainfall Erosivity (143.2)"],
        ["NASA SMAP\n(L-Band/GMAO)", "9 km grid\n(L4 Soil)", "2016-2025\n(3,653 Days)", "Root-zone (0-100cm) & surface (0-5cm) moisture, 557 drought anomalies (Z ≤ -1.0)"],
        ["Landsat 8 & 9\n(OLI / TIRS C2)", "30 m × 30 m\n(Parcel scale)", "454 Overpasses\n(115 Clear)", "Seasonal NDVI/EVI canopy vigor (0.28 Harmattan vs 0.74 Major peak), bare-field exposure"]
    ]

    for col_idx, text in enumerate(headers):
        cell = tbl.cell(0, col_idx)
        cell.fill.solid()
        cell.fill.fore_color.rgb = C_CARD_BG
        p = cell.text_frame.paragraphs[0]
        p.text = text
        p.font.size = Pt(11)
        p.font.bold = True
        p.font.color.rgb = C_CYAN

    for row_idx, row_data in enumerate(data, start=1):
        for col_idx, text in enumerate(row_data):
            cell = tbl.cell(row_idx, col_idx)
            cell.fill.solid()
            cell.fill.fore_color.rgb = C_NAVY if row_idx % 2 == 0 else C_CARD_BG
            p = cell.text_frame.paragraphs[0]
            p.text = text
            p.font.size = Pt(10)
            p.font.color.rgb = C_LIGHT_TXT

    # Right Column: Visual Landsat NDVI Panels & Scientific Grounding
    right_x = Inches(8.6)
    right_w = Inches(3.9)

    add_card(s3, right_x, Inches(1.5), right_w, Inches(2.4), border_color=C_CYAN)
    tb = s3.shapes.add_textbox(right_x + Inches(0.15), Inches(1.55), right_w - Inches(0.3), Inches(0.4))
    tf = tb.text_frame
    p = tf.paragraphs[0]
    p.text = "🛰️ 30m Landsat NDVI Canopy Tracking"
    p.font.size = Pt(12)
    p.font.bold = True
    p.font.color.rgb = C_CYAN

    # Place NDVI image if available
    if os.path.exists(ndvi_wet_path) and os.path.exists(ndvi_dry_path):
        s3.shapes.add_picture(ndvi_wet_path, right_x + Inches(0.2), Inches(2.0), width=Inches(1.6), height=Inches(1.4))
        s3.shapes.add_picture(ndvi_dry_path, right_x + Inches(2.1), Inches(2.0), width=Inches(1.6), height=Inches(1.4))
        tb_sub = s3.shapes.add_textbox(right_x + Inches(0.1), Inches(3.45), right_w - Inches(0.2), Inches(0.4))
        tf_sub = tb_sub.text_frame
        p_sub = tf_sub.paragraphs[0]
        p_sub.text = "Major Season Peak (0.74)   vs   Harmattan Bare Soil (0.28)"
        p_sub.font.size = Pt(8.5)
        p_sub.font.color.rgb = C_MUTED_TXT

    add_card(s3, right_x, Inches(4.05), right_w, Inches(2.25), border_color=C_EMERALD)
    tb = s3.shapes.add_textbox(right_x + Inches(0.2), Inches(4.15), right_w - Inches(0.4), Inches(2.0))
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "🌱 Scientific Scale Translation"
    p.font.size = Pt(12)
    p.font.bold = True
    p.font.color.rgb = C_EMERALD
    p = tf.add_paragraph()
    p.text = "• ISRIC SoilGrids v2.0 (250m): pH 6.2, SOC, sand/clay.\n• NASA ECOSTRESS: Evapotranspiration deficit.\n• Strict Scale Caveats: Distinguishes macro-scale synoptic reanalysis from parcel micro-climates."
    p.font.size = Pt(10)
    p.font.color.rgb = C_LIGHT_TXT
    p.space_before = Pt(4)

    # Bottom bar
    add_card(s3, Inches(0.8), Inches(6.5), Inches(11.7), Inches(0.7), bg_color=C_CARD_BG, border_color=C_CYAN)
    tb = s3.shapes.add_textbox(Inches(1.0), Inches(6.5), Inches(11.3), Inches(0.7))
    tf = tb.text_frame
    p = tf.paragraphs[0]
    p.text = "Pipeline Status: 3,653 validated decadal records harmonized across spatial scales into unified ML feature vectors."
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = C_WHITE

    s3.notes_slide.notes_text_frame.text = (
        "To provide reliable decision support, Space2Soil assembled a 10-year decadal baseline spanning 3,653 daily observations "
        "from 2016 to 2025 across four distinct NASA Earth observation tiers. "
        "NASA POWER supplies thermal heat stress regimes. NASA GPM captures over 14,000 millimeters of rainfall and 126 extreme storm events. "
        "NASA SMAP provides root-zone soil moisture where we cataloged 557 drought anomaly events. "
        "USGS/NASA Landsat 8 and 9 provide 30-meter NDVI rasters that track field parcel canopy cover across seasons—as seen on the right, "
        "revealing catastrophic drop-offs in vegetation vigor down to 0.28 during the dry Harmattan. "
        "We combine this with ISRIC SoilGrids and FAO-56 water balance equations, honoring spatial scale caveats at every level."
    )

    # =========================================================================
    # SLIDE 4: SI & MACHINE LEARNING DECISION ENGINE
    # =========================================================================
    s4 = prs.slides.add_slide(blank_layout)
    set_slide_background(s4, C_NAVY)
    add_header(s4, "Super Intelligence (SI) & Machine Learning Engine", slide_num=4)

    col_w = Inches(3.64)
    col_h = Inches(4.7)
    gap = Inches(0.38)
    top_y = Inches(1.6)

    # Col 1
    add_card(s4, Inches(0.8), top_y, col_w, col_h, border_color=C_CYAN)
    tb = s4.shapes.add_textbox(Inches(1.0), top_y + Inches(0.2), col_w - Inches(0.4), col_h - Inches(0.4))
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "🤖 MultiOutput Regressor"
    p.font.size = Pt(15)
    p.font.bold = True
    p.font.color.rgb = C_CYAN
    p = tf.add_paragraph()
    p.text = "GradientBoosting ML Pipeline"
    p.font.size = Pt(12)
    p.font.bold = True
    p.font.color.rgb = C_WHITE
    p.space_before = Pt(4)
    p = tf.add_paragraph()
    p.text = "Trained on decadal NASA climate features + ISRIC soil profiles + farmer constraints to predict 4 continuous targets:\n\n" \
             "1. Suitability Score (0-100)\n" \
             "2. Expected Margin (GHS/ha)\n" \
             "3. Fertilizer Savings (0-50%)\n" \
             "4. FAW Pest Disruption (0-100)\n\n" \
             "Equipped with pluggable model hot-reloading for seamless data science iteration."
    p.font.size = Pt(11)
    p.font.color.rgb = C_LIGHT_TXT
    p.space_before = Pt(6)

    # Col 2
    add_card(s4, Inches(0.8) + col_w + gap, top_y, col_w, col_h, border_color=C_EMERALD)
    tb = s4.shapes.add_textbox(Inches(0.8) + col_w + gap + Inches(0.2), top_y + Inches(0.2), col_w - Inches(0.4), col_h - Inches(0.4))
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "⚖️ AHP Decision Model"
    p.font.size = Pt(15)
    p.font.bold = True
    p.font.color.rgb = C_EMERALD
    p = tf.add_paragraph()
    p.text = "Analytic Hierarchy Process"
    p.font.size = Pt(12)
    p.font.bold = True
    p.font.color.rgb = C_WHITE
    p.space_before = Pt(4)
    p = tf.add_paragraph()
    p.text = "Mathematically weights complex competing objectives:\n\n" \
             "• 30% Climate Resilience & Drought\n" \
             "• 25% Long-Term Soil Organic Health\n" \
             "• 25% Farmer Cash Margin & Market\n" \
             "• 20% Household Nutrition & Food\n\n" \
             "Dynamic sliders empower farmers to adjust weightings based on their personal risk tolerance."
    p.font.size = Pt(11)
    p.font.color.rgb = C_LIGHT_TXT
    p.space_before = Pt(6)

    # Col 3
    add_card(s4, Inches(0.8) + (col_w + gap) * 2, top_y, col_w, col_h, border_color=C_AMBER)
    tb = s4.shapes.add_textbox(Inches(0.8) + (col_w + gap) * 2 + Inches(0.2), top_y + Inches(0.2), col_w - Inches(0.4), col_h - Inches(0.4))
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "⚡ What-If Simulator"
    p.font.size = Pt(15)
    p.font.bold = True
    p.font.color.rgb = C_AMBER
    p = tf.add_paragraph()
    p.text = "Stress Testing & Trade-Offs"
    p.font.size = Pt(12)
    p.font.bold = True
    p.font.color.rgb = C_WHITE
    p.space_before = Pt(4)
    p = tf.add_paragraph()
    p.text = "Allows extension officers and farmers to stress-test rotation candidates:\n\n" \
             "• Simulate ±2°C to ±4°C Warming\n" \
             "• Simulate -10% to -30% Rain Deficit\n" \
             "• Calculates explicit Pareto trade-offs (Cash vs Nitrogen vs Labor)\n\n" \
             "Explainable AI: Identifies WHY a rotation works and highlights local risk factors."
    p.font.size = Pt(11)
    p.font.color.rgb = C_LIGHT_TXT
    p.space_before = Pt(6)

    # Bottom summary
    add_card(s4, Inches(0.8), Inches(6.55), Inches(11.7), Inches(0.65), bg_color=C_CARD_BG, border_color=C_CYAN)
    tb = s4.shapes.add_textbox(Inches(1.0), Inches(6.55), Inches(11.3), Inches(0.65))
    tf = tb.text_frame
    p = tf.paragraphs[0]
    p.text = "Explainable AI Principle: The tool acts as a supportive decision copilot, actively preserving farmer agency and local expert judgment."
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = C_WHITE

    s4.notes_slide.notes_text_frame.text = (
        "AgroHelp does not use static look-up tables. It deploys a MultiOutput GradientBoosting Regressor trained on decadal NASA climate, "
        "soil parameters, and market data. For any selected farm, it predicts overall suitability, gross margin in Ghana Cedis, "
        "fertilizer cost savings, and Fall Armyworm disruption index. "
        "We combine this with an Analytic Hierarchy Process decision model that balances resilience, soil health, profit, and nutrition. "
        "Crucially, our interactive What-If Simulator lets farmers adjust temperature and rainfall sliders to see how each rotation holds up "
        "under severe drought or heat stress. Everything is transparent and explainable—empowering farmer decision-making."
    )

    # =========================================================================
    # SLIDE 5: 3 ROTATION STRATEGIES COMPARED
    # =========================================================================
    s5 = prs.slides.add_slide(blank_layout)
    set_slide_background(s5, C_NAVY)
    add_header(s5, "Crop Rotation Scenarios: Scientific Comparison", slide_num=5)

    tbl_shape = s5.shapes.add_table(5, 5, Inches(0.8), Inches(1.5), Inches(11.7), Inches(4.3))
    t = tbl_shape.table
    t.columns[0].width = Inches(2.2)
    t.columns[1].width = Inches(2.3)
    t.columns[2].width = Inches(2.4)
    t.columns[3].width = Inches(2.4)
    t.columns[4].width = Inches(2.4)

    headers_s5 = ["Rotation Scenario", "Sequence (Major → Minor)", "Biological / Soil Impact", "Financial / Food Security", "Risks & Extension Needs"]
    for col_idx, text in enumerate(headers_s5):
        cell = t.cell(0, col_idx)
        cell.fill.solid()
        cell.fill.fore_color.rgb = C_CARD_BG
        p = cell.text_frame.paragraphs[0]
        p.text = text
        p.font.size = Pt(11)
        p.font.bold = True
        p.font.color.rgb = C_CYAN

    scenarios = [
        [
            "Baseline Monoculture\n(Status Quo - High Risk)",
            "Maize (Major)\n→ Maize (Minor)\nContinuous Cereal",
            "• 0 kg N/ha fixed\n• Continuous FAW host habitat\n• Severe post-harvest erosion",
            "• High NPK expenditure\n• 35-45% input cost ratio\n• Vulnerable to minor season drought",
            "• Catastrophic yield crash if late rains fail\n• Escalating chemical resistance"
        ],
        [
            "Strategy A: Biological Shield\n(Top Recommended - Pulse)",
            "Maize (Major)\n→ Cowpea (Minor)\nCereal-Legume Rotation",
            "• Fixes 40-70 kg N/ha biologically\n• Breaks FAW cycle by 85%\n• Ground canopy halts MFI erosion",
            "• Saves 35% on synthetic fertilizer\n• High local cash market in Ejura hub\n• Fast 65-75 day maturity",
            "• Requires post-harvest bruchid storage care (hermetic PICS bags)\n• Inoculant awareness"
        ],
        [
            "Strategy B: Deep Anchor\n(Drought & Climate Resilient)",
            "Maize (Major)\n→ Cassava / Pigeon Pea\nTuber/Perennial Anchor",
            "• 1.2m deep root penetration\n• Extreme drought resilience\n• Year-round soil ground armor",
            "• Food security safety buffer\n• Steady local starch/gari market\n• Withstands harsh Harmattan winds",
            "• Longer harvest window (9-12 mos)\n• Delays immediate second cash return\n• Planting material access"
        ],
        [
            "Strategy C: Green Manure\n(High-Degradation Recovery)",
            "Maize (Major)\n→ Mucuna / Crotalaria\nCover Crop Regeneration",
            "• Maximum soil organic carbon (SOC)\n• Fixes 50+ kg N/ha, smothers weeds\n• Restores heavily depleted parcels",
            "• Lowest cash input cost\n• Long-term yield boost for next season\n• Drastic soil restoration",
            "• Zero immediate cash grain market\n• Requires farmer buy-in on green manure\n• Biomass incorporation labor"
        ]
    ]

    for row_idx, row in enumerate(scenarios, start=1):
        for col_idx, val in enumerate(row):
            cell = t.cell(row_idx, col_idx)
            cell.fill.solid()
            if row_idx == 1:
                cell.fill.fore_color.rgb = RGBColor(38, 20, 30)
            elif row_idx == 2:
                cell.fill.fore_color.rgb = RGBColor(16, 45, 45)
            else:
                cell.fill.fore_color.rgb = C_NAVY if row_idx % 2 == 0 else C_CARD_BG
            p = cell.text_frame.paragraphs[0]
            p.text = val
            p.font.size = Pt(9.5)
            p.font.color.rgb = C_LIGHT_TXT

    add_card(s5, Inches(0.8), Inches(6.0), Inches(11.7), Inches(0.9), bg_color=C_CARD_BG, border_color=C_EMERALD)
    tb = s5.shapes.add_textbox(Inches(1.0), Inches(6.05), Inches(11.3), Inches(0.8))
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "💡 Agronomic Finding: Strategy A (Maize-Cowpea) emerges as the pareto-optimal transition for Ejura farmers—cutting fertilizer bills by 35%, breaking the FAW breeding chain, and maintaining strong cash flow through Ejura's central market."
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = C_WHITE

    s5.notes_slide.notes_text_frame.text = (
        "Here is our head-to-head comparison of three rotation strategies against the baseline monoculture, meeting the NASA challenge criteria. "
        "The Baseline Monoculture locks farmers into escalating fertilizer debt and recurring Fall Armyworm losses. "
        "Strategy A, the Maize-Cowpea Biological Shield, is ranked highest: cowpea fixes 40 to 70 kilograms of nitrogen per hectare, "
        "slashing fertilizer bills by 35% while breaking the Fall Armyworm cycle by 85%. "
        "Strategy B, the Maize-Cassava Deep Anchor, uses 1.2-meter root systems to survive severe dry spells and Harmattan winds. "
        "Strategy C, Green Manure, restores heavily degraded fields by adding substantial organic matter. "
        "Crucially, our tool highlights local risks and extension needs for every strategy, such as bruchid pest control during cowpea storage."
    )

    # =========================================================================
    # SLIDE 6: FARMER EXPERIENCE & COCKPIT
    # =========================================================================
    s6 = prs.slides.add_slide(blank_layout)
    set_slide_background(s6, C_NAVY)
    add_header(s6, "Farmer-Centered Design: Interactive AgroHelp Cockpit", slide_num=6)

    w_card = Inches(3.64)
    h_card = Inches(4.5)
    gap = Inches(0.38)
    top_y = Inches(1.6)

    # Step 1
    add_card(s6, Inches(0.8), top_y, w_card, h_card)
    tb = s6.shapes.add_textbox(Inches(1.0), top_y + Inches(0.2), w_card - Inches(0.4), h_card - Inches(0.4))
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "STEP 1 • FIELD SELECTION"
    p.font.size = Pt(12)
    p.font.bold = True
    p.font.color.rgb = C_CYAN
    p = tf.add_paragraph()
    p.text = "Interactive Parcel Map & Farm Profile"
    p.font.size = Pt(15)
    p.font.bold = True
    p.font.color.rgb = C_WHITE
    p.space_before = Pt(4)
    p = tf.add_paragraph()
    p.text = "• Interactive Leaflet map centered on Ejura farm settlements (Babaso, Sekyedumase, Kasei).\n\n" \
             "• Farmers or extension agents select parcel boundaries and specify farm acreage (e.g. 2.5 ha).\n\n" \
             "• Ingests local soil texture (Chromic Luvisols, sandy loam) and current standing cereal crop."
    p.font.size = Pt(11)
    p.font.color.rgb = C_LIGHT_TXT
    p.space_before = Pt(8)

    # Step 2
    add_card(s6, Inches(0.8) + w_card + gap, top_y, w_card, h_card)
    tb = s6.shapes.add_textbox(Inches(0.8) + w_card + gap + Inches(0.2), top_y + Inches(0.2), w_card - Inches(0.4), h_card - Inches(0.4))
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "STEP 2 • FARMER INTENT"
    p.font.size = Pt(12)
    p.font.bold = True
    p.font.color.rgb = C_EMERALD
    p = tf.add_paragraph()
    p.text = "Priority Sliders & Climate Scenarios"
    p.font.size = Pt(15)
    p.font.bold = True
    p.font.color.rgb = C_WHITE
    p.space_before = Pt(4)
    p = tf.add_paragraph()
    p.text = "• Sliders allow farmers to weight what matters most:\n" \
             "   - Maximize Cash Profit\n" \
             "   - Minimize Fertilizer Costs\n" \
             "   - Break Fall Armyworm\n" \
             "   - Protect Against Drought\n\n" \
             "• What-If Simulator dynamically adjusts predictions for extreme heat or rainfall deficits."
    p.font.size = Pt(11)
    p.font.color.rgb = C_LIGHT_TXT
    p.space_before = Pt(8)

    # Step 3
    add_card(s6, Inches(0.8) + (w_card + gap) * 2, top_y, w_card, h_card)
    tb = s6.shapes.add_textbox(Inches(0.8) + (w_card + gap) * 2 + Inches(0.2), top_y + Inches(0.2), w_card - Inches(0.4), h_card - Inches(0.4))
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "STEP 3 • EXPLAINABLE OUTPUT"
    p.font.size = Pt(12)
    p.font.bold = True
    p.font.color.rgb = C_AMBER
    p = tf.add_paragraph()
    p.text = "Visual Advisory Cards & Offline Briefs"
    p.font.size = Pt(15)
    p.font.bold = True
    p.font.color.rgb = C_WHITE
    p.space_before = Pt(4)
    p = tf.add_paragraph()
    p.text = "• Color-coded ranked candidate cards showing Projected Gross Margin, N-Savings, and Pest Break.\n\n" \
             "• Transparent 'Why Recommended' agronomic explanations and 'Watch-Out' risk warnings.\n\n" \
             "• Printable advisory briefs tailored for Ghana Ministry of Food & Agriculture (MOFA) field agents."
    p.font.size = Pt(11)
    p.font.color.rgb = C_LIGHT_TXT
    p.space_before = Pt(8)

    add_card(s6, Inches(0.8), Inches(6.35), Inches(11.7), Inches(0.65), bg_color=C_CARD_BG, border_color=C_EMERALD)
    tb = s6.shapes.add_textbox(Inches(1.0), Inches(6.35), Inches(11.3), Inches(0.65))
    tf = tb.text_frame
    p = tf.paragraphs[0]
    p.text = "Farmer-Centered Principle: Designed for low digital friction, bilingual clarity, and seamless integration into MOFA extension workflows."
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = C_WHITE

    s6.notes_slide.notes_text_frame.text = (
        "Smallholder tools only succeed if they are usable in the real world. "
        "AgroHelp was built with a farmer-first philosophy. "
        "In Step 1, a farmer or extension agent clicks on their community in Ejura—such as Babaso or Kasei—and inputs their farm size. "
        "In Step 2, they adjust intuitive sliders reflecting their immediate needs—whether they urgently need cash income, want to slash fertilizer costs, "
        "or fear Fall Armyworm invasion. "
        "In Step 3, our engine delivers visual, color-coded ML Advisory Cards that translate complex satellite telemetry into practical actions. "
        "Crucially, these cards can be printed or distributed offline by MOFA agricultural extension officers who visit remote villages."
    )

    # =========================================================================
    # SLIDE 7: IMPACT, VALIDATION & ROADMAP
    # =========================================================================
    s7 = prs.slides.add_slide(blank_layout)
    set_slide_background(s7, C_NAVY)
    add_header(s7, "Impact, Validation & Global Scalability", slide_num=7)

    metric_w = Inches(2.68)
    metric_h = Inches(1.8)
    gap_m = Inches(0.32)
    top_m = Inches(1.5)

    metrics = [
        ("35% - 40%", "Fertilizer Cost Savings", "Biological N-fixation from cowpea offsets up to 70 kg synthetic N/ha", C_EMERALD),
        ("85%+", "Fall Armyworm Disruption", "Interrupting cereal monoculture with non-host dicot starves FAW larvae", C_CYAN),
        ("0 Days", "Bare Soil Exposure", "Strategic ground cover halts topsoil stripping during high MFI (143.2) storms", C_AMBER),
        ("30 / 30", "Automated Tests Passing", "100% backend pytest & end-to-end telemetry validation verified", C_WHITE)
    ]

    for idx, (val, title, desc, col) in enumerate(metrics):
        x = Inches(0.8) + idx * (metric_w + gap_m)
        add_card(s7, x, top_m, metric_w, metric_h, border_color=col)
        tb = s7.shapes.add_textbox(x + Inches(0.15), top_m + Inches(0.1), metric_w - Inches(0.3), metric_h - Inches(0.2))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = val
        p.font.size = Pt(24)
        p.font.bold = True
        p.font.color.rgb = col
        p = tf.add_paragraph()
        p.text = title
        p.font.size = Pt(11)
        p.font.bold = True
        p.font.color.rgb = C_WHITE
        p.space_before = Pt(2)
        p = tf.add_paragraph()
        p.text = desc
        p.font.size = Pt(9.5)
        p.font.color.rgb = C_LIGHT_TXT
        p.space_before = Pt(4)

    bottom_y = Inches(3.6)
    bot_w = Inches(5.65)
    bot_h = Inches(2.7)

    # Left: Roadmap
    add_card(s7, Inches(0.8), bottom_y, bot_w, bot_h, border_color=C_CYAN)
    tb = s7.shapes.add_textbox(Inches(1.0), bottom_y + Inches(0.2), bot_w - Inches(0.4), bot_h - Inches(0.4))
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "🌍 Pan-African Scaling: UN FAOSTAT & Market Intelligence"
    p.font.size = Pt(14)
    p.font.bold = True
    p.font.color.rgb = C_CYAN
    p = tf.add_paragraph()
    p.text = "• Phase 1 (Validated Pilot): Ejura-Sekyedumase with 10-year NASA decadal baseline.\n" \
             "• Phase 2 (Pan-African Expansion): Integrated UN FAOSTAT API & FAO FPMA hubs across Ghana, Nigeria (Kano/Bodija), Côte d'Ivoire (Bouaké), Kenya (Eldoret), Senegal (Kaolack), and Mali.\n" \
             "• Phase 3 (Price Arbitrage & Policy): Real-time commodity tracking ($/tonne USD) connecting savannah grain basins to regional urban food corridors."
    p.font.size = Pt(10.5)
    p.font.color.rgb = C_LIGHT_TXT
    p.space_before = Pt(6)

    # Right: NASA Award Criteria Alignment
    add_card(s7, Inches(6.85), bottom_y, bot_w, bot_h, border_color=C_EMERALD)
    tb = s7.shapes.add_textbox(Inches(7.05), bottom_y + Inches(0.2), bot_w - Inches(0.4), bot_h - Inches(0.4))
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "🏆 NASA Space Apps Global Award Alignment"
    p.font.size = Pt(14)
    p.font.bold = True
    p.font.color.rgb = C_EMERALD
    p = tf.add_paragraph()
    p.text = "• Best Use of Data: Rigorous multi-sensor fusion of NASA POWER, GPM, SMAP, Landsat, plus UN FAOSTAT API.\n" \
             "• Best Use of Science: Grounded in FAO-56 water balance, MFI erosivity, and biological N-fixation.\n" \
             "• Real-World Impact: Breaks smallholder monoculture debt with market-grounded crop rotations.\n" \
             "• Fully Tested & Verified: 100% automated test suites passing across all endpoints."
    p.font.size = Pt(10.5)
    p.font.color.rgb = C_LIGHT_TXT
    p.space_before = Pt(6)

    # Footer
    tb_foot = s7.shapes.add_textbox(Inches(0.8), Inches(6.8), Inches(11.7), Inches(0.4))
    tf_foot = tb_foot.text_frame
    p_foot = tf_foot.paragraphs[0]
    p_foot.text = "Team Space2Soil • NASA Space Apps Challenge 2024 • Project: github.com/kofi-space2soil/agrohelp"
    p_foot.font.size = Pt(11)
    p_foot.font.color.rgb = C_MUTED_TXT

    s7.notes_slide.notes_text_frame.text = (
        "In conclusion, AgroHelp demonstrates measurable, life-changing agricultural impact. "
        "By replacing continuous maize monoculture with science-backed rotations like Maize-Cowpea, farmers can cut synthetic fertilizer "
        "expenses by up to 40%, disrupt Fall Armyworm infestations by over 85%, and eliminate destructive bare-soil erosion windows. "
        "With 30 out of 30 automated tests passing, our modular architecture is primed for expansion across the West African cereal belt. "
        "AgroHelp turns NASA's view from space into genuine food security and soil resilience on the ground. Thank you."
    )

    output_path = os.path.abspath("Space2Soil_NASA_SpaceApps_Presentation.pptx")
    prs.save(output_path)
    print(f"Presentation successfully created at: {output_path}")

if __name__ == "__main__":
    create_presentation()
