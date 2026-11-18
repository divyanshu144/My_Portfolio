"""Generate the downloadable CV from the portfolio data (requires reportlab)."""
import json
from pathlib import Path
from xml.sax.saxutils import escape
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, KeepTogether

root = Path(__file__).resolve().parents[1]
data = json.loads((root / 'data/portfolioData.json').read_text())
out = root / 'public/assets/Divyanshu-Charak-CV.pdf'
styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name='NameCV', fontName='Helvetica-Bold', fontSize=25, leading=30, textColor=colors.HexColor('#202731'), spaceAfter=8))
styles.add(ParagraphStyle(name='SectionCV', fontName='Helvetica-Bold', fontSize=11, leading=15, textColor=colors.HexColor('#806026'), spaceBefore=18, spaceAfter=9))
styles.add(ParagraphStyle(name='RoleCV', fontName='Helvetica-Bold', fontSize=10, leading=14, spaceAfter=3))
styles.add(ParagraphStyle(name='TextCV', fontName='Helvetica', fontSize=9.5, leading=14, spaceAfter=6))
styles.add(ParagraphStyle(name='MetaCV', fontName='Helvetica', fontSize=8.5, leading=12, textColor=colors.HexColor('#555c66'), spaceAfter=7))
styles.add(ParagraphStyle(name='BulletCV', parent=styles['TextCV'], leftIndent=10, firstLineIndent=-8, spaceAfter=5))
story=[]
def p(text, style='TextCV'):
    return Paragraph(escape(text), styles[style])
def section(text):
    story.append(p(text.upper(), 'SectionCV'))
def footer(canvas, doc):
    canvas.setStrokeColor(colors.HexColor('#dadde1')); canvas.line(42, 37, A4[0]-42, 37)
    canvas.setFont('Helvetica',8); canvas.setFillColor(colors.HexColor('#555c66'))
    canvas.drawString(42,24,'Divyanshu Charak | Applied AI & software engineering')
    canvas.drawRightString(A4[0]-42,24,str(doc.page))
story += [p(data['name'],'NameCV'), p('Applied AI Engineer | Full-stack engineering | Statistical Data Science','RoleCV'),p(f"{data['location']}  |  {data['contact']['email']}  |  {data['contact']['phone']}",'MetaCV')]
for label,key in [('GitHub','github'),('LinkedIn','linkedin')]:
    url=escape(data['contact'][key], {'"':'&quot;'})
    story.append(Paragraph(f'<link href="{url}" color="#806026">{label}: {url}</link>',styles['MetaCV']))
story.append(Spacer(1,8))
story.append(p('Applied AI engineer with three years at Mphasis building banking and visa-processing systems, followed by an MSc in Statistical Data Science at Exeter. I build applications around retrieval, agent workflows and deterministic tools, with attention to evaluation, recoverability and observable behavior.'))
section('Professional experience')
for job in data['experience']:
    block=[p(job['title']+' | '+job['company'],'RoleCV'),p(job['dates']+' | '+job['location'],'MetaCV')]
    block += [p('• '+line,'BulletCV') for line in job['highlights']]
    story.append(KeepTogether(block)); story.append(Spacer(1,6))
section('Education')
for edu in data['education']:
    block=[p(edu['degree']+' | '+edu['institution'],'RoleCV'),p(edu['dates']+' | '+edu.get('grade',''),'MetaCV')]
    if edu.get('dissertation'): block.append(p(edu['dissertation']))
    story.append(KeepTogether(block))
story.append(PageBreak())
story += [p('Selected engineering work','NameCV'),p('Personal projects | Architecture, implementation and evaluation','MetaCV')]
for name in ['DocChat','JobFit','SuperOps']:
    project=next(x for x in data['projects'] if x['name']==name)
    study=project['caseStudy']
    section(name)
    story.append(p(project['summary']))
    story.append(p(study['decision']))
    if name=='DocChat':
        story.append(p('Retrieval evaluation: MRR 0.834 for the default vs 0.761 for hybrid on 127 questions / 14 sources. Additional questions were LLM-generated; labels were not independently audited.'))
    story.append(p('Stack: '+', '.join(project['tech']),'MetaCV'))
    url=escape(project['repo'])
    story.append(Paragraph(f'<link href="{url}" color="#806026">{url}</link>',styles['MetaCV']))
section('Technical skills')
labels={'languages':'Languages','ai_ml':'AI & ML','backend_apis':'Backend & APIs','data_etl':'Data & ETL','devops':'DevOps','frontend':'Frontend'}
for key, items in data['skills'].items():
    story.append(p(labels.get(key,key)+': '+', '.join(items)))
SimpleDocTemplate(str(out),pagesize=A4,rightMargin=42,leftMargin=42,topMargin=38,bottomMargin=50,title='Divyanshu Charak — CV',author=data['name']).build(story,onFirstPage=footer,onLaterPages=footer)
print(out)
