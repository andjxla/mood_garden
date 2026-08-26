require "sinatra"
require "sinatra/reloader" if development?
require "json"
require "date"

set :public_folder, "public"

DATA_FILE = "data/entries.json"

def load_entries
  JSON.parse(File.read(DATA_FILE))
end

def save_entries(entries)
  File.write(DATA_FILE, JSON.pretty_generate(entries))
end

def current_streak(entries)
  return 0 if entries.empty?

  dates = entries.map { |e| Date.parse(e["date"]) }.uniq.sort.reverse
  streak = 0
  expected = Date.today


dates.each do |d|
  break unless d == expected
  streak += 1
  expected -= 1
end

streak
end

get "/" do
  @entries = load_entries
  @streak = current_streak(@entries)
  erb :index
end

post "/entries" do
  content_type :json

  mood = params[:mood]
  entries = load_entries

  entries << {
    "date" => Date.today.to_s,
    "mood" => mood
  }
  save_entries(entries)

  {
    streak: current_streak(entries),
    last_mood: mood
}.to_json
end