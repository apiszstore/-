import Icon from './Icon.jsx';

/**
 * Mockup dashboard, dibangun dari HTML/CSS (bukan gambar stok)
 * supaya isinya benar-benar relevan: Discord, code, dan SA-MP.
 *
 * Menghemat satu screenshot besar dan tetap tajam di semua ukuran.
 */

const CHANNELS = [
  { name: 'pengumuman', icon: '📢', active: false },
  { name: 'general', icon: '#', active: true },
  { name: 'bot-log', icon: '⌘', active: false },
];

const MESSAGES = [
  {
    name: 'APISZ',
    role: 'Staff',
    time: '09:12',
    accent: true,
    lines: ['Server siap dipakai. Kategori, role,', 'sama permission sudah dirapikan.'],
  },
  {
    name: 'setup-progress',
    time: '09:14',
    code: ['if (cmd == "start") {', '    Setup server();', '}'],
  },
];

export default function HeroMockup() {
  return (
    <div className="relative">
      {/* Window utama */}
      <div className="overflow-hidden rounded-lg border border-line bg-surface shadow-lift">
        {/* Title bar */}
        <div className="flex items-center gap-2 border-b border-line bg-raised px-4 py-2.5">
          <span className="flex gap-1.5" aria-hidden="true">
            <span className="size-2.5 rounded-full bg-[#4b4d54]" />
            <span className="size-2.5 rounded-full bg-[#4b4d54]" />
            <span className="size-2.5 rounded-full bg-brand/70" />
          </span>
          <span className="ml-2 font-mono text-[11px] text-faint">apisz.store / dashboard</span>
        </div>

        <div className="flex min-h-[19rem] sm:min-h-[21rem]">
          {/* Sidebar */}
          <aside className="hidden w-40 shrink-0 flex-col gap-4 border-r border-line bg-raised/60 p-3 sm:flex">
            <div>
              <p className="px-1.5 text-[10px] font-bold tracking-[0.14em] text-faint uppercase">APISZ Server</p>
            </div>

            <div className="flex flex-col gap-0.5">
              <p className="px-1.5 pb-1 text-[10px] font-semibold tracking-wide text-faint">TEXT CHANNELS</p>
              {CHANNELS.map((channel) => (
                <span
                  key={channel.name}
                  className={`flex items-center gap-1.5 rounded-xs px-1.5 py-1.5 text-[12.5px] ${
                    channel.active ? 'bg-white/6 font-medium text-ink' : 'text-muted'
                  }`}
                >
                  <span className={channel.active ? 'text-faint' : 'text-faint/70'}>{channel.icon}</span>
                  {channel.name}
                </span>
              ))}
            </div>

            <div className="mt-auto rounded-sm border border-line bg-surface/70 p-2.5">
              <p className="text-[10px] font-semibold text-faint">SERVER ONLINE</p>
              <p className="mt-0.5 flex items-center gap-1.5 text-[12px] font-semibold text-available">
                <span className="size-1.5 rounded-full bg-available" aria-hidden="true" />
                Ready
              </p>
            </div>
          </aside>

          {/* Chat */}
          <div className="flex min-w-0 flex-1 flex-col p-4">
            <div className="mb-3 flex items-center gap-2 border-b border-line pb-2.5">
              <span className="text-faint">#</span>
              <span className="text-[13px] font-semibold">general</span>
            </div>

            <div className="flex flex-1 flex-col gap-3.5">
              {MESSAGES.map((message, index) => (
                <div key={index} className="flex gap-2.5">
                  <span
                    className={`mt-0.5 grid size-8 shrink-0 place-items-center rounded-sm text-[11px] font-bold ${
                      message.accent ? 'bg-brand text-brand-ink' : 'bg-well text-brand'
                    }`}
                    aria-hidden="true"
                  >
                    {message.accent ? 'A' : '</>'}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-baseline gap-2">
                      <span className="text-[13px] font-semibold text-ink">{message.name}</span>
                      {message.role ? (
                        <span className="rounded-xs bg-brand/15 px-1.5 py-px text-[10px] font-bold text-brand">
                          {message.role}
                        </span>
                      ) : null}
                      <span className="text-[10.5px] text-faint">{message.time}</span>
                    </p>

                    {message.code ? (
                      <pre className="mt-1.5 overflow-x-auto rounded-sm border border-line bg-well px-3 py-2 font-mono text-[11.5px] leading-relaxed text-muted">
                        <code>{message.code.join('\n')}</code>
                      </pre>
                    ) : (
                      <p className="mt-0.5 text-[13px] leading-relaxed text-muted">
                        {message.lines.map((line) => (
                          <span key={line} className="block">
                            {line}
                          </span>
                        ))}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 flex items-center gap-2 rounded-sm border border-line bg-well px-3 py-2.5">
              <span className="text-faint">+</span>
              <span className="text-[12.5px] text-faint">Message #general</span>
            </div>
          </div>
        </div>
      </div>

      {/* Kartu kilasan SA-MP */}
      <div className="absolute -bottom-5 -left-3 hidden w-44 rounded-md border border-line bg-surface p-3 shadow-lift sm:block">
        <p className="flex items-center gap-1.5 text-[10px] font-bold tracking-[0.14em] text-faint uppercase">
          <Icon name="terminal" size={12} className="text-brand" />
          SA-MP
        </p>
        <p className="mt-1.5 font-mono text-[11.5px] text-muted">gamemode.cfg</p>
        <p className="mt-1 text-[12px] leading-relaxed text-faint">
          Bug fix &amp; custom feature
        </p>
      </div>
    </div>
  );
}
